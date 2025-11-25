import { sequelize } from "@/config";
import {
  COMMON_ERROR_MESSAGES,
  PREFERENCE_ASSOCIATIONS,
  PREFERENCE_ERROR_MESSAGES,
  USER_DEFAULT_PREFERENCES_KEYS,
} from "@/constants";
import { Preference, PreferenceOption } from "@/models/mysql";
import { UserService } from "@/services";
import { AppError } from "@/utils";

import type { PreferenceCategoryKey } from "@/types";
import type { Transaction } from "sequelize";

export class PreferenceService {
  /**
   * Retrieves all preferences for a given user.
   *
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Preference[]>} - A list of the user's preferences.
   * @throws {AppError} - If:
   *   - The user does not exist (HTTP 500, thrown by UserService.findById).
   */
  public static async getUserPreferences(userId: string): Promise<Preference[]> {
    await UserService.findById(userId, 500);

    const preferences = await Preference.findAll({
      where: { user_id: userId },
      include: PREFERENCE_ASSOCIATIONS,
    });

    return preferences;
  }

  /**
   * Retrieves a user's preference for a specific category.
   *
   * @param {string} userId - The ID of the user.
   * @param {PreferenceCategoryKey} categoryKey - The key of the preference category.
   * @returns {Promise<Preference>} - The returned preference instance.
   * @throws {AppError} - If:
   *   - The user does not exist (HTTP 500, thrown by UserService.findById).
   *   - The preference does not exist for the user and category - data integrity issue (HTTP 500).
   */
  public static async getUserPreferenceForCategory(
    userId: string,
    categoryKey: PreferenceCategoryKey
  ): Promise<Preference> {
    await UserService.findById(userId, 500);

    const preference = await Preference.findOne({
      where: { user_id: userId },
      include: [
        { association: "category", where: { key: categoryKey }, required: true },
        { association: "option" },
      ],
    });

    if (!preference) {
      throw new AppError({
        statusCode: 500,
        userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        debugMessage: `[PreferenceService.getUserPreferenceForCategory] Preference not found for user '${userId}' and category '${categoryKey}' - data integrity issue`,
      });
    }

    return preference;
  }

  /**
   * Creates default user preferences during user registration.
   * This method must be called within a transaction to ensure atomicity.
   *
   * @param {string} userId - The ID of the user.
   * @param {Transaction} transaction - The Sequelize transaction.
   * @returns {Promise<void>}
   * @throws {AppError} - If:
   *   - Default preference options are not properly configured in the database (HTTP 500).
   */
  public static async createUserDefaultPreferences(
    userId: string,
    transaction: Transaction
  ): Promise<void> {
    const options = await PreferenceOption.findAll({
      where: { key: USER_DEFAULT_PREFERENCES_KEYS },
      transaction,
    });

    const expectedCount = USER_DEFAULT_PREFERENCES_KEYS.length;

    if (!options || options.length !== expectedCount) {
      throw new AppError({
        statusCode: 500,
        userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        debugMessage: `[PreferenceService.createUserDefaultPreferences] Unable to initialize user preferences - Database misconfiguration: expected ${expectedCount} default preference options, but found ${
          options?.length || 0
        }`,
      });
    }

    await Promise.all(
      options.map((o) => Preference.create({ user_id: userId, option_id: o.id }, { transaction }))
    );
  }

  /**
   * Updates a user's preference for a specific category.
   *
   * @param {string} userId - The ID of the user.
   * @param {PreferenceCategoryKey} categoryKey - The key of the preference category.
   * @param {string} optionKey - The key of the preference option.
   * @returns {Promise<Preference>} - The updated preference instance with associations.
   * @throws {AppError} - If:
   *   - The user does not exist (HTTP 500, thrown by UserService.findById).
   *   - The option does not exist or doesn't belong to the category (HTTP 400).
   *   - The preference does not exist for the user and category - data integrity issue (HTTP 500).
   */
  public static async updateUserPreferenceForCategory(
    userId: string,
    categoryKey: PreferenceCategoryKey,
    optionKey: string
  ): Promise<Preference> {
    await UserService.findById(userId, 500);

    const option = await PreferenceOption.findOne({
      where: { key: optionKey },
      include: [{ association: "category", where: { key: categoryKey }, required: true }],
    });

    if (!option) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: PREFERENCE_ERROR_MESSAGES.INVALID_OPTION,
        debugMessage: `[PreferenceService.updateUserPreference] Option '${optionKey}' not found for category '${categoryKey}'`,
      });
    }

    return sequelize.transaction(async (t) => {
      const preference = await Preference.findOne({
        where: { user_id: userId, category_id: option.category!.id },
        transaction: t,
      });

      if (!preference) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          debugMessage: `[PreferenceService.updateUserPreference] Preference not found for user '${userId}' and category '${categoryKey}' - data integrity issue`,
        });
      }

      preference.option_id = option.id;
      await preference.save({ transaction: t, fields: ["option_id"] });

      await preference.reload({
        include: PREFERENCE_ASSOCIATIONS,
        transaction: t,
      });

      return preference;
    });
  }
}
