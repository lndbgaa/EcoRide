import bcrypt from "bcrypt";
import { DataTypes, Model, Op } from "sequelize";

import { dayjs } from "@/config";
import {
  COMMON_ERROR_MESSAGES,
  REGEX,
  REVIEW_MAX_RATING,
  REVIEW_MIN_RATING,
  USER_ERROR_MESSAGES,
  USER_ROLES_ID,
  USER_STATUSES,
} from "@/constants";
import { AppError, calculateAge, capitalize, formatDateOnly, formatDateTimeFromUTC, setIfChanged } from "@/utils";

import type { Role } from "@/models";
import type { UpdateUserInfoPayload, UserAdminDTO, UserPrivateDTO, UserPublicDTO, UserRoleId, UserStatus } from "@/types";
import type { TFunction } from "i18next";
import type { SaveOptions, Sequelize } from "sequelize";

const { ACTIVE, SUSPENDED, PENDING_DELETION, DELETED } = USER_STATUSES;

export default class User extends Model {
  declare id: string;
  declare role_id: UserRoleId;
  declare email: string;
  declare username: string;
  declare password: string;
  declare first_name: string | null;
  declare last_name: string | null;
  declare birth_date: Date | null;
  declare phone: string | null;
  declare address: string | null;
  declare profile_picture: string | null;
  declare average_rating: number | null;
  declare credits: number;
  declare status: UserStatus;
  declare email_is_verified: boolean;
  declare last_login: Date | null;
  declare suspended_at: Date | null;
  declare pending_deletion_at: Date | null;
  declare deleted_at: Date | null;
  declare created_at: Date;
  declare updated_at: Date;

  declare role?: Role;

  // ----------------------------
  // Status Checks
  // ----------------------------

  public isActive(): boolean {
    return this.status === ACTIVE;
  }

  public isSuspended(): boolean {
    return this.status === SUSPENDED;
  }

  public isPendingDeletion(): boolean {
    return this.status === PENDING_DELETION;
  }

  public isDeleted(): boolean {
    return this.status === DELETED;
  }

  // ------------------------------------
  // Private Status Transitions
  // ------------------------------------

  private static readonly allowedStatusTransitions: Record<UserStatus, UserStatus[]> = {
    active: [SUSPENDED, PENDING_DELETION],
    suspended: [ACTIVE],
    pending_deletion: [ACTIVE, DELETED],
    deleted: [],
  } as const;

  private canTransitionTo(newStatus: UserStatus): boolean {
    return User.allowedStatusTransitions[this.status]?.includes(newStatus) ?? false;
  }

  private async transitionTo(newStatus: UserStatus, options?: SaveOptions): Promise<void> {
    if (this.status === newStatus) return;

    if (!this.canTransitionTo(newStatus)) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
        debugMessage: `User ${this.id} cannot transition from ${this.status} to ${newStatus}.`,
      });
    }

    const nowDate = dayjs().toDate();

    this.status = newStatus;
    this.suspended_at = null;
    this.pending_deletion_at = null;
    this.deleted_at = null;

    switch (newStatus) {
      case SUSPENDED:
        this.suspended_at = nowDate;
        break;
      case PENDING_DELETION:
        this.pending_deletion_at = nowDate;
        break;
      case DELETED:
        this.deleted_at = nowDate;
        break;
      case ACTIVE:
        break;
    }

    await this.save({
      ...options,
      fields: ["status", "suspended_at", "pending_deletion_at", "deleted_at"],
    });
  }

  // ------------------------------------
  // Public Status Transitions
  // ------------------------------------
  public async markAsActive(options?: SaveOptions): Promise<void> {
    await this.transitionTo(ACTIVE, options);
  }

  public async markAsSuspended(options?: SaveOptions): Promise<void> {
    await this.transitionTo(SUSPENDED, options);
  }

  public async markAsPendingDeletion(options?: SaveOptions): Promise<void> {
    await this.transitionTo(PENDING_DELETION, options);
  }

  public async markAsDeleted(options?: SaveOptions): Promise<void> {
    await this.transitionTo(DELETED, options);
  }

  // ------------------------------------
  // Authentication
  // ------------------------------------

  public async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  public async markEmailAsVerified(options?: SaveOptions): Promise<void> {
    if (this.email_is_verified) return;
    this.email_is_verified = true;
    await this.save({ ...options, fields: ["email_is_verified"] });
  }

  // ------------------------------------
  // Business Logic
  // ------------------------------------

  /**
   * Updates the profile information of the current user instance.
   * Only saves fields that have actually changed based on the provided data.
   *
   * @param {UpdateUserInfoPayload} data - The object containing the new user information.
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<User>} The updated user instance.
   * @throws {AppError} 400 if no changes were detected between the current instance and the provided data.
   */
  public async updateProfile(data: UpdateUserInfoPayload, options?: SaveOptions): Promise<User> {
    const updatedFields: string[] = [];

    if (setIfChanged(this, "username", data.username, false)) updatedFields.push("username");
    if (setIfChanged(this, "first_name", data.firstName, false)) updatedFields.push("first_name");
    if (setIfChanged(this, "last_name", data.lastName, false)) updatedFields.push("last_name");
    if (setIfChanged(this, "birth_date", data.birthDate, false)) updatedFields.push("birth_date");
    if (setIfChanged(this, "address", data.address, true)) updatedFields.push("address");
    if (setIfChanged(this, "phone", data.phone, true)) updatedFields.push("phone");

    if (updatedFields.length === 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: COMMON_ERROR_MESSAGES.NO_CHANGES_DETECTED,
      });
    }

    return await this.save({ ...options, fields: updatedFields });
  }

  /**
   * Adds a specified amount of credits to the user's current credit balance.
   *
   * @param {number} amount - The amount of credits to add.
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<void>}
   * @throws {AppError} 400 if the amount is not a positive integer.
   */
  public async addCredits(amount: number, options?: SaveOptions): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.INVALID_CREDIT_AMOUNT,
        debugMessage: `Invalid add amount: ${amount}. Must be a positive integer.`,
      });
    }

    await this.increment("credits", { by: amount, ...options });
    this.credits = (this.credits ?? 0) + amount;
  }

  /**
   * Removes a specified amount of credits to the user's current credit balance.
   *
   * @param {number} amount - The amount of credits to remove.
   * @param {SaveOptions} [options] - Additional Sequelize save options.
   * @returns {Promise<void>}
   * @throws {AppError} 400 if the amount is not a positive integer.
   * @throws {AppError} 400 if the user does not have enough credits for the removal.
   */
  public async removeCredits(amount: number, options?: SaveOptions): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.INVALID_CREDIT_AMOUNT,
        debugMessage: `Invalid remove amount: ${amount}. Must be a positive integer.`,
      });
    }

    if (this.credits < amount) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: USER_ERROR_MESSAGES.INSUFFICIENT_CREDITS,
        debugMessage: `Cannot remove credits: User ${this.id} has insufficient credits. Current: ${this.credits}, attempted removal: ${amount}.`,
      });
    }

    await this.decrement("credits", { by: amount, ...options });
    this.credits = (this.credits ?? 0) - amount;
  }

  // ------------------------------------
  // DTOs
  // ------------------------------------

  public toPublicDTO(): UserPublicDTO {
    return {
      id: this.id,
      username: this.username,
      firstName: this.first_name,
      age: this.birth_date ? calculateAge(this.birth_date) : null,
      avatar: this.profile_picture,
      averageRating: this.average_rating,
      emailIsVerified: this.email_is_verified,
      isDeleted: !!this.deleted_at,
      createdAt: formatDateTimeFromUTC(this.created_at),
    };
  }

  public toPrivateDTO(): UserPrivateDTO {
    return {
      ...this.toPublicDTO(),
      email: this.email,
      lastName: this.last_name ? this.last_name : null,
      phone: this.phone,
      address: this.address,
      credits: this.credits,
      birthDate: this.birth_date ? formatDateOnly(this.birth_date) : null,
      lastLogin: this.last_login ? formatDateTimeFromUTC(this.last_login) : null,
    };
  }

  public toAdminDTO(t: TFunction): UserAdminDTO {
    return {
      ...this.toPrivateDTO(),
      role: this.role?.toDTO(t) ?? null,
      status: this.status,
      suspendedAt: this.suspended_at ? formatDateTimeFromUTC(this.suspended_at) : null,
      pendingDeletionAt: this.pending_deletion_at ? formatDateTimeFromUTC(this.pending_deletion_at) : null,
      deletedAt: this.deleted_at ? formatDateTimeFromUTC(this.deleted_at) : null,
    };
  }

  // ------------------------------------
  // Model init
  // ------------------------------------

  public static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        role_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: "roles", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
          validate: {
            isIn: {
              args: [Object.values(USER_ROLES_ID)],
              msg: "Invalid role. Role must be one of the predefined roles",
            },
          },
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: "Email is required" },
            isEmail: { msg: "Email must be valid" },
          },
        },
        username: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: "Username is required" },
            len: {
              args: [3, 100],
              msg: "Username must be between 3 and 100 characters long",
            },
            is: {
              args: REGEX.username,
              msg: "Username must start with a letter and contain only letters, numbers, hyphens or underscores",
            },
          },
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: { notEmpty: { msg: "Password is required" } },
        },
        first_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            is: {
              args: REGEX.firstName,
              msg: "First name contains invalid characters",
            },
          },
        },
        last_name: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            is: {
              args: REGEX.lastName,
              msg: "Last name contains invalid characters",
            },
          },
        },
        birth_date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          validate: {
            isDate: { args: true, msg: "Birth date must be a valid date" },
            notInFuture(value: string) {
              const now = dayjs();
              if (value && dayjs(value).isAfter(now)) {
                throw new Error("Birth date cannot be in the future");
              }
            },
          },
        },
        phone: {
          type: DataTypes.STRING(50),
          allowNull: true,
          validate: {
            isValidPhone(value: string | null) {
              if (value && !REGEX.phoneFR.test(value)) {
                throw new Error("Phone number must be a valid French phone number");
              }
            },
          },
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        profile_picture: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            isUrl: { msg: "Profile picture must be a valid URL" },
          },
        },
        average_rating: {
          type: DataTypes.DECIMAL(3, 1),
          allowNull: true,
          validate: {
            min: {
              args: [REVIEW_MIN_RATING],
              msg: `Average rating must be at least ${REVIEW_MIN_RATING}`,
            },
            max: {
              args: [REVIEW_MAX_RATING],
              msg: `Average rating cannot exceed ${REVIEW_MAX_RATING}`,
            },
          },
        },
        credits: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: { args: [0], msg: "Credits cannot be negative" },
            isInt: { msg: "Credits must be an integer" },
          },
        },
        status: {
          type: DataTypes.ENUM(...Object.values(USER_STATUSES)),
          allowNull: false,
          defaultValue: ACTIVE,
        },
        email_is_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        last_login: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        suspended_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        pending_deletion_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        deleted_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "users",
        modelName: "User",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        defaultScope: {
          where: {
            status: { [Op.ne]: DELETED },
            deleted_at: null,
          },
        },
        scopes: {
          withDeleted: {
            where: {},
          },
          onlyDeleted: {
            where: { status: DELETED, deleted_at: { [Op.not]: null } },
          },
        },
        hooks: {
          beforeSave: async (user: User) => {
            if (user.changed("password")) {
              const saltRounds = 10;
              const salt = await bcrypt.genSalt(saltRounds);
              user.password = await bcrypt.hash(user.password, salt);
            }
          },
          
          beforeValidate: (user: User) => {
            if (typeof user.email === "string") user.email = user.email.trim().toLowerCase();
            if (typeof user.username === "string") user.username = user.username.trim();
            if (typeof user.first_name === "string") user.first_name = capitalize(user.first_name);
            if (typeof user.last_name === "string") user.last_name = capitalize(user.last_name);
            if (typeof user.phone === "string") user.phone = user.phone.trim();
            if (typeof user.address === "string") user.address = user.address.trim();
            if (typeof user.profile_picture === "string") user.profile_picture = user.profile_picture.trim();
          },
        },
      }
    );
  }
}
