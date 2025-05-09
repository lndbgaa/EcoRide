import { axiosPrivate } from "api/axiosInstance";

class BookingService {
  static async cancelBooking(bookingId: string) {
    const response = await axiosPrivate.patch(`/bookings/${bookingId}/cancel`);
    return response.data;
  }
}

export default BookingService;
