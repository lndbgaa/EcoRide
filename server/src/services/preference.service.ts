import Preference from "@/models/mysql/Preference.model.js";
import UserService from "@/services/user.service.js";
import AppError from "@/utils/AppError.js";

class PreferenceService {
  public static async findOwnedPreferenceOrThrow(userId: string, preferenceId: string) {
    const preference = await Preference.findOneByField("id", preferenceId);

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

  public static async getPreferences(userId: string): Promise<Preference[]> {
    const preferences = await Preference.findAllByField("user_id", userId);

    return preferences;
  }

  public static async createPreference(userId: string, data: any) {
    await UserService.assertUserIsDriverOrThrow(userId);

    const { label, value } = data;

    const preference = await Preference.createOne({
      user_id: userId,
      label,
      value,
      is_custom: true,
    });

    return preference;
  }

  public static async togglePreferenceValue(userId: string, preferenceId: string) {
    await UserService.assertUserIsDriverOrThrow(userId);

    const preference = await this.findOwnedPreferenceOrThrow(userId, preferenceId);

    await preference.toggleValue();
  }

  public static async deletePreference(userId: string, preferenceId: string) {
    await UserService.assertUserIsDriverOrThrow(userId);

    const preference = await this.findOwnedPreferenceOrThrow(userId, preferenceId);

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
