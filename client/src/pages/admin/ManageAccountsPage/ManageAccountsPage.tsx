import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import TreeIllustation from "@/assets/images/tree-illustration.svg?react";

import Loader from "@/components/Loader/Loader";
import AdminService from "@/services/AdminService";

import styles from "./ManageAccountsPage.module.css";

type AccountStatus = "active" | "suspended";
type AccountRole = "user" | "employee" | "admin";

interface Account {
  id: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
}

const ManageAccountsPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isManagingAccount, setIsManagingAccount] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  const filteredAccounts = accounts.filter((account) =>
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (accountId: string): void => {
    setAccounts(
      accounts.map((account) => {
        if (account.id === accountId) {
          return {
            ...account,
            status: account.status === "active" ? "suspended" : "active",
          };
        }
        return account;
      })
    );
  };

  const getRoleLabel = (role: AccountRole): string => {
    const labels = {
      user: "Utilisateur",
      employee: "Employé",
      admin: "Administrateur",
    };

    return labels[role];
  };

  const handleRetry = async (): Promise<void> => {
    if (isRetrying) return;

    setIsRetrying(true);
    await fetchAccounts();
    setIsRetrying(false);
  };

  const fetchAccounts = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await AdminService.getAllAccounts();
      setAccounts(response.data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const suspendAccount = async (accountId: string): Promise<void> => {
    if (isManagingAccount) return;

    setIsManagingAccount(true);

    try {
      await AdminService.suspendAccount(accountId);
      toggleStatus(accountId);
      toast.success("Compte suspendu avec succès");
    } catch {
      toast.error("Une erreur est survenue lors de la suspension du compte");
    } finally {
      setIsManagingAccount(false);
    }
  };

  const unsuspendAccount = async (accountId: string): Promise<void> => {
    if (isManagingAccount) return;

    setIsManagingAccount(true);

    try {
      await AdminService.unsuspendAccount(accountId);
      toggleStatus(accountId);
      toast.success("Compte réactivé avec succès");
    } catch {
      toast.error("Une erreur est survenue lors de la réactivation du compte");
    } finally {
      setIsManagingAccount(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <TreeIllustation className={styles.illustration} />
          <p>Une erreur est survenue lors de la récupération des comptes.</p>
          <button className={styles.retryButton} onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? "Un instant..." : "Réessayer"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Gérer les comptes</h1>

      <div className={styles.manageAccountsContainer}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Rechercher par email..."
            value={searchQuery}
            className={styles.searchInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.accountsContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Email</th>
                <th className={styles.tableHeader}>Rôle</th>
                <th className={styles.tableHeader}>Statut</th>
                <th className={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{account.email}</td>
                  <td className={styles.tableCell}>{getRoleLabel(account.role)}</td>
                  <td className={styles.tableCell}>
                    <span
                      className={`${styles.badge} ${
                        account.status === "active" ? styles.badgeActive : styles.badgeSuspended
                      }`}
                    >
                      {account.status === "active" ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <button
                      disabled={isManagingAccount}
                      onClick={() =>
                        account.status === "active" ? suspendAccount(account.id) : unsuspendAccount(account.id)
                      }
                      className={`${styles.button} ${
                        account.status === "active" ? styles.buttonSuspend : styles.buttonActivate
                      }`}
                    >
                      {isManagingAccount ? "Un instant..." : account.status === "active" ? "Suspendre" : "Réactiver"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAccountsPage;
