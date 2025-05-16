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
}

export default BookingService;
