import { DEFAULT_PREFERENCES } from "@/models/mysql/Preference.model.js";

import { Preference } from "@/models/mysql";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

class PreferenceService {
  /**
   * Vérifie si une préférence appartient bien à un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param preferenceId - L'id de la préférence
   * @returns La préférence trouvée
   */
  public static async findOwnedPreferenceOrThrow(
    userId: string,
    preferenceId: string
  ): Promise<Preference> {
    const preference: Preference | null = await Preference.findOneByField("id", preferenceId);

    if (!preference) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Préférence non trouvée.",
      });
    }

    if (preference.user_id !== userId) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous n'avez pas les permissions pour modifier cette préférence.",
      });
    }

    return preference;
  }

  /**
   * Définit les préférences par défaut pour un utilisateur lors de son inscription
   * @param userId - L'id de l'utilisateur
   */
  public static async defineDefaultPreferences(userId: string): Promise<void> {
    await Promise.all(
      DEFAULT_PREFERENCES.map((preference) =>
        Preference.createOne({
          user_id: userId,
          label: preference.label,
          value: preference.value,
          is_custom: false,
        })
      )
    );
  }

  /**
   * Récupère les préférences d'un utilisateur
   * @param userId - L'id de l'utilisateur
   * @returns Les préférences de l'utilisateur
   */
  public static async getPreferences(userId: string): Promise<Preference[]> {
    const preferences: Preference[] = await Preference.findAllByField("user_id", userId);
    return preferences;
  }

  /**
   * Crée une préférence pour un utilisateur
   * @param userId - L'id de l'utilisateur
   * @param data - Les données de la préférence (label, value)
   * @returns La préférence créée
   */
  public static async createPreference(
    userId: string,
    data: { label: string; value: boolean }
  ): Promise<Preference> {
    await UserService.assertUserIsDriverOrThrow(userId);

    const { label, value } = data;

    const preference: Preference = await Preference.createOne({
      user_id: userId,
      label,
      value,
      is_custom: true,
    });

    return preference;
  }

  /**
   * Bascule la valeur d'une préférence
   * @param userId - L'id de l'utilisateur
   * @param preferenceId - L'id de la préférence
   * @returns La préférence mise à jour
   */
  public static async togglePreferenceValue(
    userId: string,
    preferenceId: string
  ): Promise<Preference> {
    await UserService.assertUserIsDriverOrThrow(userId);

    const preference: Preference = await this.findOwnedPreferenceOrThrow(userId, preferenceId);

    await preference.toggleValue();

    return preference;
  }

  /**
   * Supprime une préférence
   * @param userId - L'id de l'utilisateur
   * @param preferenceId - L'id de la préférence
   */
  public static async deletePreference(userId: string, preferenceId: string): Promise<void> {
    await UserService.assertUserIsDriverOrThrow(userId);

    const preference: Preference = await this.findOwnedPreferenceOrThrow(userId, preferenceId);

    if (preference.isDefault()) {
      throw new AppError({
        statusCode: 403,
        statusText: "Forbidden",
        message: "Vous ne pouvez pas supprimer une préférence par défaut.",
      });
    }

    await preference.destroy();
  }
}

export default PreferenceService;
