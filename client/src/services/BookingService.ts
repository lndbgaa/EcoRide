import { axiosPrivate } from "api/axiosInstance";

class BookingService {
  static async createBooking(data: { rideId: string; seats: number }) {
    const response = await axiosPrivate.post(`/bookings`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  static async cancelBooking(bookingId: string) {
    const response = await axiosPrivate.patch(
      `/bookings/${bookingId}/cancel`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  }

  static async validateBooking(bookingId: string) {
    const response = await axiosPrivate.patch(
      `/bookings/${bookingId}/validate-success`,
      {},
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  }

  static async validateBookingWithIncident(bookingId: string, data: { description: string }) {
    const response = await axiosPrivate.patch(`/bookings/${bookingId}/validate-incident`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }
}

export default BookingService;
