import { sequelize } from "@/config";
import {
  COMMON_ERROR_MESSAGES,
  PREFERENCE_ASSOCIATIONS,
  PREFERENCE_ERROR_MESSAGES,
  USER_DEFAULT_PREFERENCES_KEYS,
} from "@/constants";
import { Preference, PreferenceOption } from "@/models";
import { AppError } from "@/utils";

import type { User } from "@/models";
import type { PreferenceCategoryKey } from "@/types";
import type { Transaction } from "sequelize";

export class PreferenceService {
  /**
   * Retrieves all preferences for a given user.
   *
   * @param {User} user
   * @returns {Promise<Preference[]>} A list of the user's preferences.
   */
  public static async getUserPreferences(user: User): Promise<Preference[]> {
    const preferences = await Preference.findAll({
      where: { user_id: user.id },
      include: PREFERENCE_ASSOCIATIONS,
    });

    return preferences;
  }

  /**
   * Creates default user preferences during user registration.
   * This method must be called within a transaction to ensure atomicity.
   *
   * @param {User} user
   * @param {Transaction} transaction - The Sequelize transaction.
   * @returns {Promise<void>}
   * @throws {AppError} 500 if default preference options are not properly configured in database.
   */
  public static async createUserDefaultPreferences(user: User, transaction: Transaction): Promise<void> {
    const options = await PreferenceOption.findAll({
      where: { key: USER_DEFAULT_PREFERENCES_KEYS },
      transaction,
    });

    const expectedCount = USER_DEFAULT_PREFERENCES_KEYS.length;

    if (!options || options.length !== expectedCount) {
      throw new AppError({
        statusCode: 500,
        userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        debugMessage: `Unable to initialize user preferences - Database misconfiguration: expected ${expectedCount} default preference options, but found ${
          options?.length || 0
        }`,
      });
    }

    await Promise.all(options.map((o) => Preference.create({ user_id: user.id, option_id: o.id }, { transaction })));
  }

  /**
   * Updates a user's preference for a specific category.
   *
   * @param {User} user
   * @param {PreferenceCategoryKey} categoryKey - The key of the preference category.
   * @param {string} optionKey - The key of the new preference option.
   * @returns {Promise<Preference>} The updated preference instance with associations.
   * @throws {AppError} 400 if option does not exist or doesn't belong to the category.
   * @throws {AppError} 500 if preference does not exist for the user and category - data integrity issue.
   */
  public static async updateUserPreferenceForCategory(
    user: User,
    categoryKey: PreferenceCategoryKey,
    optionKey: string
  ): Promise<Preference> {
    const option = await PreferenceOption.findOne({
      where: { key: optionKey },
      include: [{ association: "category", where: { key: categoryKey }, required: true }],
    });

    if (!option) {
      throw new AppError({
        statusCode: 400,
        userMessageKey: PREFERENCE_ERROR_MESSAGES.INVALID_OPTION,
        debugMessage: `Option '${optionKey}' not found for category '${categoryKey}.'`,
      });
    }

    return sequelize.transaction(async (t) => {
      const preference = await Preference.findOne({
        where: { user_id: user.id, category_id: option.category!.id },
        transaction: t,
      });

      if (!preference) {
        throw new AppError({
          statusCode: 500,
          userMessageKey: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          debugMessage: `Preference not found for user '${user.id}' and category '${categoryKey}' - data integrity issue.`,
        });
      }

      preference.option_id = option.id;
      await preference.save({ fields: ["option_id"], transaction: t });

      await preference.reload({
        include: PREFERENCE_ASSOCIATIONS,
        transaction: t,
      });

      return preference;
    });
  }
}
