import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

import Loader from "@/components/Loader/Loader";
import AdminService from "@/services/AdminService";

import styles from "./AdminDashboardPage.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const [dailyRides, setDailyRides] = useState<{ date: string; count: number }[]>([]);
  const [dailyCredits, setDailyCredits] = useState<{ date: string; credits: number }[]>([]);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  const handleRetry = async (action: () => Promise<void>): Promise<void> => {
    setIsRetrying(true);
    await action();
    setIsRetrying(false);
  };

  const fetchDailyRides = async (): Promise<void> => {
    try {
      const ridesData = await AdminService.getDailyRides();
      setDailyRides(ridesData);
    } catch {
      setError((prev) => ({ ...prev, dailyRides: "Une erreur est survenue lors de la récupération des données" }));
    }
  };

  const fetchDailyCredits = async (): Promise<void> => {
    try {
      const creditsData = await AdminService.getDailyCredits();
      setDailyCredits(creditsData);
    } catch {
      setError((prev) => ({ ...prev, dailyCredits: "Une erreur est survenue lors de la récupération des données" }));
    }
  };

  const fetchTotalCredits = async (): Promise<void> => {
    try {
      const totalCreditsData = await AdminService.getTotalCredits();
      setTotalCredits(totalCreditsData.totalCredits);
    } catch {
      setError((prev) => ({ ...prev, totalCredits: "Une erreur est survenue lors de la récupération des données" }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError({});

      try {
        await fetchDailyRides();
        await fetchDailyCredits();
        await fetchTotalCredits();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const ridesChartData = {
    labels: dailyRides.map((item) => item.date),
    datasets: [
      {
        label: "Nombre de covoiturages",
        data: dailyRides.map((item) => item.count),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const creditsChartData = {
    labels: dailyCredits.map((item) => item.date),
    datasets: [
      {
        label: "Crédits générés",
        data: dailyCredits.map((item) => item.credits),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        offset: true,
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        suggestedMax: 20,
      },
    },
  };

  const ErrorDisplay = ({ errorMessage, action }: { errorMessage: string; action: () => Promise<void> }) => (
    <div className={styles.errorContainer}>
      <p className={styles.errorMessage}>{errorMessage}</p>
      <button onClick={() => handleRetry(action)} className={styles.retryButton} disabled={isRetrying}>
        {isRetrying ? "Un instant..." : "Réessayer"}
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.buttonsContainer}>
        <Link to="/admin/create-employee" className={styles.button}>
          Enregistrer employé
        </Link>
        <Link to="/admin/manage-accounts" className={styles.button}>
          Gérer les comptes
        </Link>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statsSection}>
          <div className={styles.totalCredits}>
            <h2>Total des crédits générés</h2>
            {error.totalCredits ? (
              <ErrorDisplay errorMessage={error.totalCredits} action={fetchTotalCredits} />
            ) : (
              <p>{totalCredits}</p>
            )}
          </div>

          <div className={styles.chartsContainer}>
            <div className={styles.chartWrapper}>
              <h2>Covoiturages par jour</h2>
              {error.dailyRides ? (
                <ErrorDisplay errorMessage={error.dailyRides} action={fetchDailyRides} />
              ) : (
                <Line data={ridesChartData} options={chartOptions} />
              )}
            </div>

            <div className={styles.chartWrapper}>
              <h2>Crédits générés par jour</h2>
              {error.dailyCredits ? (
                <ErrorDisplay errorMessage={error.dailyCredits} action={fetchDailyCredits} />
              ) : (
                <Line data={creditsChartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
