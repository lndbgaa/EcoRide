import { PREFERENCE_CATEGORY_KEY_TO_ID } from "@/constants";
import { PreferenceOption, VehicleBrand, VehicleColor, VehicleEnergy } from "@/models";

import type { PreferenceCategoryKey } from "@/types";

export class ReferenceService {
  /**
   * Retrieves all available vehicle colors.
   *
   * @returns {Promise<VehicleColor[]>} - A list of all vehicle colors ordered by name.
   */
  public static async getAllColors(): Promise<VehicleColor[]> {
    return await VehicleColor.findAll({
      order: [["key", "ASC"]],
    });
  }

  /**
   * Retrieves all available vehicle brands.
   *
   * @returns {Promise<VehicleBrand[]>} - A list of all vehicle brands ordered by name.
   */
  public static async getAllBrands(): Promise<VehicleBrand[]> {
    return await VehicleBrand.findAll({
      order: [["key", "ASC"]],
    });
  }

  /**
   * Retrieves all available vehicle energy types.
   *
   * @returns {Promise<VehicleEnergy[]>} - A list of all vehicle energy types ordered by name.
   */
  public static async getAllEnergies(): Promise<VehicleEnergy[]> {
    return await VehicleEnergy.findAll({
      order: [["key", "ASC"]],
    });
  }

  /**
   *
   *
   * @returns {Promise<PreferenceOption[]>} -
   */
  public static async getPreferenceOptions(categoryKey: PreferenceCategoryKey): Promise<PreferenceOption[]> {
    const categoryId = PREFERENCE_CATEGORY_KEY_TO_ID[categoryKey];

    const options = await PreferenceOption.findAll({
      where: { category_id: categoryId },
      include: [{ association: "category" }],
    });

    return options;
  }
}
