import { axiosPrivate, axiosPublic } from "../../api/axiosInstance";

import type { Booking } from "@/types/BookingTypes";
import type { Preference } from "@/types/PreferenceTypes";
import type { ReceivedReview, WrittenReview } from "@/types/ReviewTypes";
import type { Ride } from "@/types/RideTypes";
import type { UpdateUserInfo, User, UserNextTrip, UserUpcomingTrip } from "@/types/UserTypes";
import type { Vehicle } from "@/types/VehicleTypes";

class UserService {
  /**
   * Récupère les informations d'un utilisateur
   */
  static async getUserInfo(userId: string): Promise<User> {
    const url = `/users/${userId}`;
    const response = await axiosPublic.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  static async getMyInfo(): Promise<User> {
    const url = "/users/me";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Modifie les informations de l'utilisateur connecté
   */
  static async updateMyInfo(data: UpdateUserInfo) {
    const url = "/users/me";
    await axiosPrivate.patch(url, data);
  }

  /**
   * Modifie l'avatar de l'utilisateur connecté
   */
  static async updateMyAvatar(file: File): Promise<{ url: string }> {
    const url = "/users/me/avatar";
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosPrivate.patch(url, formData);
    const { data } = response.data;
    return data;
  }

  /**
   * Modifie le rôle de l'utilisateur connecté
   */
  static async toggleMyRole(role: string) {
    const url = "/users/me/role";
    await axiosPrivate.patch(url, { role });
  }

  /**
   * Récupère les véhicules de l'utilisateur connecté
   */
  static async getMyVehicles(): Promise<Vehicle[]> {
    const url = "/users/me/vehicles";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère les préférences de l'utilisateur connecté
   */
  static async getMyPreferences(): Promise<Preference[]> {
    const url = "/users/me/preferences";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère le prochain événement de l'utilisateur connecté (réservation, trajet)
   */
  static async getMyNextTrip(): Promise<UserNextTrip | null> {
    const url = "/users/me/events/next";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data ?? null;
  }

  /**
   * Récupère tous les évènements à venir de l'utilisateur connecté (réservation, trajet)
   */
  static async getMyUpcomingTrips(): Promise<UserUpcomingTrip[]> {
    const url = "/users/me/events/upcoming";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data ?? [];
  }

  /**
   * Récupère l'historique des trajets de l'utilisateur connecté
   */
  static async getMyRidesHistory(): Promise<Ride[]> {
    const url = "/users/me/rides";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère l'historique des réservations de l'utilisateur connecté
   */
  static async getMyBookingsHistory(): Promise<Booking[]> {
    const url = "/users/me/bookings";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère l'historique des avis reçus par l'utilisateur connecté
   */
  static async getMyReceivedReviews(): Promise<ReceivedReview[]> {
    const url = "/users/me/reviews/received";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }

  /**
   * Récupère l'historique des avis écrits par l'utilisateur connecté
   */
  static async getMyWrittenReviews(): Promise<WrittenReview[]> {
    const url = "/users/me/reviews/written";
    const response = await axiosPrivate.get(url);
    const { data } = response.data;
    return data;
  }
}

export default UserService;
