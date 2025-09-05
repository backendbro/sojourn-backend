import { numberOfNights } from 'src/utils';
import { SingleBookingView } from 'src/utils/bookings-utils';

export const hostBookingInvoiceTemplate = ({
  propertyTitle,
  checkInDate,
  checkOutDate,
  location,
  priceOfProperty,
  numberOfAdults,
  numberOfChildren,
  numberOfInfants,
  status,
  guestName,
  guestPhone,
  payment,
  paymentDate,
  serviceFee,
  paymentMethod,
  bookingReference,
  total,
}: SingleBookingView) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Sojourn email</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Raleway:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style type="text/css">
      html {
        -webkit-text-size-adjust: none;
        -ms-text-size-adjust: none;
        font-family: 'Raleway', sans-serif;
      }
      a {
        text-decoration: none;
        color: #de5353;
        font-size: 16px;
        line-height: 20px;
      }
      a:hover {
        opacity: 0.5;
      }
      button:hover {
        opacity: 0.8;
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff">
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
    >
      <tr>
        <td bgcolor="#FFFFFF">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="color: #ffffff"
          >
            <tr>
              <td align="center" style="padding: 35px 10px 35px 10px"></td>
            </tr>
            <tr>
              <td>
                <table
                  align="center"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  style="
                    max-width: 640px;
                    min-width: 300px;
                    background-color: #fffdfa;
                    border: 1px solid #feebc7;
                    border-radius: 20px 20px 20px 20px;
                  "
                >
                  <tr>
                    <td>
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 640px; min-width: 300px"
                      >
                        <tr>
                          <td style="padding: 62px 52px 40px 52px">
                            <img
                              src="https://sojourn-v1-assets.s3.eu-north-1.amazonaws.com/public/images/emails/Sojourn-logo-red.png"
                              alt="Sojourn"
                              title="Sojourn"
                              width="147"
                              style="
                                display: block;
                                max-width: 147px;
                                max-height: 43px;
                              "
                            />
                          </td>
                          <td
                            style="padding: 62px 52px 40px 52px"
                            align="right"
                          >
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 18px;
                                font-weight: 600;
                                line-height: 21px;
                                margin-top: 0;
                                margin-bottom: 0;
                              "
                            >
                              Booking #${bookingReference}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                   <tr>
                    <td style="padding: 0 46px 32px 46px">
                      <h2
                        style="
                          color: #2c2c2c;
                          font-size: 22px;
                          line-height: 28px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        ${propertyTitle}
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 32px 46px">
                      <h2
                        style="
                          color: #2c2c2c;
                          font-size: 22px;
                          line-height: 28px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                          text-transform:capitalize;
                        "
                      >
                        status:${status}
                      </h2>
                    </td>
                  </tr>
                <tr>
                    <td style="padding: 0 46px 32px 46px">
                      <h2
                        style="
                          color: #2c2c2c;
                          font-size: 22px;
                          line-height: 28px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Number of adults: ${numberOfAdults}
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 32px 46px">
                      <h2
                        style="
                          color: #2c2c2c;
                          font-size: 22px;
                          line-height: 28px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Number of children: ${numberOfChildren}
                      </h2>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 32px 46px">
                      <h2
                        style="
                          color: #2c2c2c;
                          font-size: 22px;
                          line-height: 28px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Number of Infants: ${numberOfInfants}
                      </h2>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 0 46px 26px 46px">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 640px; min-width: 300px"
                      >
                        <tr>
                          <td style="padding: 0 10px 0 0; width: 15px">
                            <img
                              src="https://sojourn-v1-assets.s3.eu-north-1.amazonaws.com/public/images/emails/map-pin.jpg"
                              alt="address"
                            />
                          </td>
                          <td style="padding: 0 0 0 0">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 21px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${location}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 26px 46px">
                      <h5
                        style="
                          color: #2c2c2c;
                          font-size: 20px;
                          line-height: 23px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Reservation details
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 14px 46px">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 640px; min-width: 300px"
                      >
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Check in
                            </p>
                          </td>
                          <td style="padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${checkInDate}
                              <span
                                style="
                                  color: #8f989b;
                                  font-size: 16px;
                                  line-height: 24px;
                                  margin-top: 0;
                                  margin-bottom: 0;
                                  margin-left: 8px;
                                  font-weight: 500;
                                "
                                >(from 15:00)</span
                              >
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Check out
                            </p>
                          </td>
                          <td style="padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${checkOutDate}
                              <span
                                style="
                                  color: #8f989b;
                                  font-size: 16px;
                                  line-height: 24px;
                                  margin-top: 0;
                                  margin-bottom: 0;
                                  margin-left: 8px;
                                  font-weight: 500;
                                "
                                >(until 12:00)</span
                              >
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Duration
                            </p>
                          </td>
                          <td style="padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${numberOfNights(new Date(checkInDate), new Date(checkOutDate))} nights
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 48px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Location
                            </p>
                          </td>
                          <td style="padding-bottom: 48px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${location}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Booked by
                            </p>
                          </td>
                          <td style="padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${guestName}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 48px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Phone
                            </p>
                          </td>
                          <td style="padding-bottom: 48px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ${guestPhone}
                            </p>
                          </td>
                        </tr>
                        <!--
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 48px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Prepayment
                            </p>
                          </td>
                          <td style="padding-bottom: 48px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              Information about prepayment.
                            </p>
                          </td>
                        </tr>
-->
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #8f989b;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 600;
                              "
                            >
                              Cancellation policy
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 26px 46px">
                      <h5
                        style="
                          color: #2c2c2c;
                          font-size: 20px;
                          line-height: 23px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Price details
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 0 46px">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 640px; min-width: 300px"
                      >
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 500;
                              "
                            >
                              ₦${priceOfProperty} x ${numberOfNights(new Date(checkInDate), new Date(checkOutDate))} night
                            </p>
                          </td>
                          <td style="padding-bottom: 16px; text-align: right">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ₦${payment}
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 500;
                              "
                            >
                              Service fee
                            </p>
                          </td>
                          <td style="padding-bottom: 16px; text-align: right">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ₦${serviceFee}
                            </p>
                          </td>
                        </tr>

                        <tr>
                          <td style="padding-right: 10px; padding-bottom: 16px">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 500;
                              "
                            >
                              Damage protection <br /><span
                                style="
                                  color: #8f989b;
                                  font-size: 16px;
                                  line-height: 20px;
                                  font-weight: 500;
                                "
                                >Payment method</span
                              >
                            </p>
                          </td>
                          <td style="padding-bottom: 16px; text-align: right">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 16px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 400;
                              "
                            >
                              ₦${paymentMethod}
                            </p>
                          </td>
                        </tr>
                         <tr>
                    <td style="padding: 0 46px 32px 46px">
                      <h2
                        style="
                          color: #2c2c2c;
                          font-size: 22px;
                          line-height: 28px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Payment date: ${paymentDate}
                      </h2>
                    </td>
                  </tr>
                 
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style="padding: 32px 46px 32px 46px; text-align: center"
                    >
                      <div style="border-top: 1px solid #e3ac42"></div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 24px 46px; text-align: center">
                      <table
                        align="center"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 640px; min-width: 300px"
                      >
                        <tr>
                          <td style="padding-right: 10px; text-align: left">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 20px;
                                line-height: 20px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 700;
                              "
                            >
                              Earnings <br /><span
                                style="font-size: 14px; font-weight: 400"
                                >(including taxes & fees)</span
                              >
                            </p>
                          </td>
                          <td style="text-align: right">
                            <p
                              style="
                                color: #2c2c2c;
                                font-size: 20px;
                                line-height: 24px;
                                margin-top: 0;
                                margin-bottom: 0;
                                font-weight: 700;
                              "
                            >
                              ${total}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 48px 46px">
                      <p
                        style="
                          color: #2c2c2c;
                          font-size: 14px;
                          line-height: 19px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 400;
                        "
                      >
                        This is the total you will earn from this booking which
                        is automatically credited to your host wallet. However,
                        the available balance for withdrawal at any given time
                        is subject to the commencement and number of days
                        elapsed from the boooking stay.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 16px 46px">
                      <h5
                        style="
                          color: #2c2c2c;
                          font-size: 20px;
                          line-height: 23px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Cancellation policy
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 48px 46px">
                      <p
                        style="
                          color: #2c2c2c;
                          font-size: 18px;
                          line-height: 30px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 400;
                        "
                      >
                        Review the Host’s full
                        <a
                          href="#"
                          style="
                            color: #de5353;
                            text-decoration: none;
                            font-size: 18px;
                            line-height: 30px;
                            margin-top: 0;
                            margin-bottom: 0;
                            font-weight: 600;
                          "
                          >Cancellation policy</a
                        >
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 16px 46px">
                      <h5
                        style="
                          color: #2c2c2c;
                          font-size: 20px;
                          line-height: 23px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 600;
                        "
                      >
                        Contact your guest
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 48px 46px">
                      <p
                        style="
                          color: #2c2c2c;
                          font-size: 18px;
                          line-height: 30px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 400;
                        "
                      >
                        Have a question or guidelines? You can chat with your
                        guest on the site.
                      </p>
                      <p
                        style="
                          color: #2c2c2c;
                          font-size: 18px;
                          line-height: 30px;
                          margin-top: 0;
                          margin-bottom: 0;
                          font-weight: 400;
                        "
                      >
                        <a
                          href="https://sojourn.ng/dashboard/bookings"
                          style="
                            color: #de5353;
                            text-decoration: none;
                            font-size: 18px;
                            line-height: 30px;
                            margin-top: 0;
                            margin-bottom: 0;
                            font-weight: 600;
                          "
                          >Chat with guest</a
                        >
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 46px 60px 46px; text-align: center">
                      <a href="#"
                        ><button
                          type="button"
                          style="
                            cursor: pointer;
                            background-color: #de5353;
                            border: none;
                            padding: 31px 22px;
                            border-radius: 59px;
                            color: #ffffff;
                            font-size: 18px;
                            line-height: 18px;
                            font-weight: 600;
                            max-width: 432px;
                            width: 100%;
                          "
                        >
                          Check your booking
                        </button></a
                      >
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 57px 83px 57px">
                      <a
                        href="https://www.sojourn.ng/"
                        style="
                          font-size: 16px;
                          line-height: 18px;
                          color: #2c2c2c;
                          font-weight: 400;
                          margin-bottom: 10px;
                          margin-top: 0;
                        "
                      >
                        Sojourn Nigeria
                      </a>
                      <!--
                      <p
                        style="
                          font-size: 16px;
                          line-height: 18px;
                          color: #2c2c2c;
                          font-weight: 400;
                          margin-bottom: 10px;
                          margin-top: 0;
                        "
                      >
                        Sojourn,Inc., Warsaw, 2 Green St, WA94-103, Poland,
                      </p>
-->
                      <p
                        style="
                          font-size: 16px;
                          line-height: 20px;
                          color: #de5353;
                          font-weight: 500;
                          margin-bottom: 0;
                          margin-top: 0;
                        "
                      >
                        <br />
                        <a href="https://www.sojourn.ng/privacy-policy"
                          >Privacy policy</a
                        >
                        |
                        <a href="mailto:support@sojourn.ng">Contact support</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
