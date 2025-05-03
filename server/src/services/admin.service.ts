import AccountService from "@/services/account.service.js";
import AppError from "@/utils/AppError.js";

/**
 * Service des opérations admin.
 */
class AdminService {
  /**
   * Suspend un compte par son identifiant
   * @param id - Identifiant du compte à suspendre
   */
  public static async suspendAccount(id: string): Promise<void> {
    const account = await AccountService.findOneById(id);

    if (!account) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Compte introuvable. Le compte a peut-être été supprimé.",
      });
    }

    if (account.isSuspended()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le compte est déjà suspendu.",
      });
    }

    await account.suspend();
  }

  /**
   * Réactive un compte suspendu par son identifiant
   * @param id - Identifiant du compte à réactiver
   */
  public static async unsuspendAccount(id: string): Promise<void> {
    const account = await AccountService.findOneById(id);

    if (!account) {
      throw new AppError({
        statusCode: 404,
        statusText: "Not Found",
        message: "Compte introuvable. Le compte a peut-être été supprimé.",
      });
    }

    if (!account.isSuspended()) {
      throw new AppError({
        statusCode: 400,
        statusText: "Bad Request",
        message: "Le compte n'est pas suspendu.",
      });
    }

    await account.unsuspend();
  }
}

export default AdminService;
