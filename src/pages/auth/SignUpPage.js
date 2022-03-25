import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import SignupAnimation from "../../images/signup.json";
import Login from "../../images/Mobile-login-rafiki.png";
import authentication from "../../services/firebase/index";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { doctorLogin, patientLogin } from "../../redux/actions/userAuthAction";
import { useHistory } from "react-router-dom";

export default function SignUpPage(props) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const dispatch = useDispatch();
  const type = props.location.state.type;
  const [otp, setOTP] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const currentUser = useSelector((state) => state.authReducer);

  const [toggleOTPCard, setToggleOTPCard] = useState(false);

  useEffect(() => {
    if (currentUser.isLoggedIn) history.push("/dashboard");
  }, []);
  useEffect(() => {
    console.log(currentUser);
    if (currentUser.isLoginLoading) {
      console.log("LOADING");
    } else {
      setLoading(false);
      if (!!currentUser.isSignupError) {
        setMessage(currentUser.isSignupError);
      } else if (currentUser.isRegistered && currentUser.type === "patient") {
        fetch(`http://localhost:4000/send-text?recipient=${phoneNumber}`).catch(err=>console.log(err));
        history.push("/dashboard");
      } else if (currentUser.isRegistered && currentUser.type === "doctor") {
        history.push("/doctor-dashboard");
      }else if (currentUser.isSignedUp && currentUser.type === "patient") {
        history.push("/profile");
      } else if (currentUser.isSignedUp && currentUser.type === "doctor") {
        fetch(`http://localhost:4000/?recipient=${phoneNumber}`).catch(err=>console.log(err));
        history.push("/doctor-profile");
      }
    }
  }, [currentUser]);

  const handleNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleOTP = (e) => {
    setOTP(e.target.value);
  };

  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
      authentication
    );
  };

  const sendOTP = () => {
    console.log("PHONENUMBER",phoneNumber)
    let number = "+1" + phoneNumber;
    if (number.length >= 12) {
      generateRecaptcha();
      let appVerifier = window.recaptchaVerifier;
      console.log("G");
      signInWithPhoneNumber(authentication, number, appVerifier)
        .then((confirmationResult) => {
          window.confirmationResult = confirmationResult;
          console.log("G2");
          setOTP("");
          setToggleOTPCard(!toggleOTPCard);
          // ...
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const verifyOTP = () => {
    let otpValue = otp;
    if (otpValue.length === 6) {
      console.log(otpValue);
      let confirmationResult = window.confirmationResult;
      confirmationResult
        .confirm(otpValue)
        .then((result) => {
          const user = result.user;
          let token = JSON.stringify(user);
          token = JSON.parse(token);
          sessionStorage.setItem("token", token.stsTokenManager.accessToken);
          handleSubmit(user)
        })
        .catch((error) => {});
    }
  };

  const handleSubmit = async (data) => {
    console.log(data);
    setLoading(true);
    if (type === "patient") dispatch(patientLogin(data));
    else dispatch(doctorLogin(data));
  };

  // console.log(type)

  // const generateResendRecaptcha = () => {
  //   window.recaptchaVerifier = new RecaptchaVerifier(
  //     "resendOTP-container",
  //     {
  //       size: "invisible",
  //       callback: (response) => {
  //         // reCAPTCHA solved, allow signInWithPhoneNumber.
  //       },
  //     },
  //     authentication
  //   );
  // };

  const resendingOTP = () => {
    let number = "+91" + phoneNumber;
    console.log(number);

    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(authentication, number, appVerifier)
      .then((confirmationResult) => {
        console.log(true);
        window.confirmationResult = confirmationResult;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="overflow-hidden">
      {!toggleOTPCard ? (
        <div className="h-full bg-tertiary">
          <div className="flex overflow-hidden">
            <div className="lg:w-full w-1/4 mt-0 hidden lg:block flex flex-col justify-center items-center">
              <a
                href="/"
                className="flex justify-start ml-10 mt-5 text-xl text-primary font-semibold tracking-widest cursor-pointer"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 91 104"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M33.0594 7.22629V13.6461H58.7385V7.22629C58.7385 3.68137 61.6074 0.806519 65.1583 0.806519C68.7092 0.806519 71.5781 3.68137 71.5781 7.22629V13.6461H81.2077C86.5241 13.6461 90.8374 17.9573 90.8374 23.2757V32.9054H0.960602V23.2757C0.960602 17.9573 5.27188 13.6461 10.5903 13.6461H20.2199V7.22629C20.2199 3.68137 23.0887 0.806519 26.6397 0.806519C30.1906 0.806519 33.0594 3.68137 33.0594 7.22629ZM0.960602 39.3251H90.8374V93.8932C90.8374 99.2095 86.5241 103.523 81.2077 103.523H10.5903C5.27188 103.523 0.960602 99.2095 0.960602 93.8932V39.3251Z"
                    fill="#1B87C4"
                  />
                  <path
                    d="M18.6482 70.0769H1.24896L1.24893 75.894H23.0976L29.9081 63.1315L42.5694 86.0068C42.5694 86.0068 43.236 87.1137 45.5217 87.1137C47.8074 87.1137 48.4907 86.0068 48.4907 86.0068L59.7297 67.9279L64.7972 75.894H90.3719V70.0769H68.7555C68.7555 70.0769 63.9217 60.831 62.4643 59.7225C61.007 58.6139 60.6091 58.6384 59.2899 58.7466C58.2433 58.8324 58.4628 58.3503 56.8805 59.7225C55.2982 61.0946 45.5217 77.5669 45.5217 77.5669C45.5217 77.5669 33.9836 55.6908 32.7861 54.2871C31.5886 52.8834 31.0724 52.9129 29.6883 52.8914C28.2544 52.869 27.5304 53.2788 26.4453 54.2871C25.3601 55.2954 18.6482 70.0769 18.6482 70.0769Z"
                    fill="white"
                    stroke="white"
                  />
                </svg>
                VirQue
              </a>
              <div className="h-full flex flex-col justify-center items-center">
                <div className="lg:max-w-xl md:max-w-lg lg:w-md md:w-1/2 w-5/6">
                  <Lottie animationData={SignupAnimation} />
                </div>
                <div className="text-xl text-primary font-semibold">
                  Let's get you setup!
                </div>
                <div className="text-xl text-primary font-semibold flex justify-center">
                  Enter the 10 digit phone number you want to link with your
                  account
                </div>
                <div className="flex justify-center mt-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 20 20"
                    fill="#3DA0DE"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 ml-6 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#3DA0DE"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-primary w-full h-full overflow-hidden h-screen">
              <div className="mx-auto max-w-lg p-8 md:p-12 rounded-xl">
                <section className="header mt-40 lg:mt-60">
                  
                  <div className="flex items-center justify-center">
                    
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-10 w-10 mb-5"
                      viewBox="0 0 20 20"
                      fill="white"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    
                  </div>
                  
                  <div className="number mb-6 pt-3 rounded-xl bg-light">
                    <input
                      placeholder="Enter your number"
                      type="number"
                      id="number"
                      value={phoneNumber}
                      onChange={(e) => handleNumberChange(e)}
                      className="bg-light rounded-full w-full text-gray-800 focus:outline-none focus:border-primary transition duration-500 px-3 pb-3 tracking-widest"
                    />
                  </div>

                  <div className="space-y-3 flex flex-col pointer">
                    <button
                      className="bg-white font-bold py-2 rounded hover:shadow-xl transition duration-200 text-primary"
                      onClick={sendOTP}
                    >
                      Next
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <div id="recaptcha-container" />
        </div>
      ) : (
        <div className="h-full bg-tertiary">
          <div className="flex overflow-hidden">
            <div className="lg:w-full w-1/4 mt-0 hidden lg:block flex flex-col justify-center items-center">
              <div className="flex justify-start ml-10 mt-5 text-xl text-primary font-semibold tracking-widest">
                VirQue
              </div>
              <div className="h-full flex flex-col justify-center items-center">
                <img src={Login} style={{ height: "500px" }} alt="Login" />
                <div className="text-xl text-primary font-semibold">
                  Let's get you setup!
                </div>
                <div className="text-xl text-primary font-semibold flex justify-center">
                  Enter the 6 digit OTP
                </div>
                <div className="flex justify-center mt-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-6 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#3DA0DE"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 20 20"
                    fill="#3DA0DE"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-primary w-full h-full overflow-hidden h-screen">
              <div className="mx-auto max-w-lg p-8 md:p-12 rounded-xl">
                <section className="header mt-60">
                  <div className="flex justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-10 w-10 mb-5"
                      viewBox="0 0 20 20"
                      fill="white"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>

                  <div className="otp mb-6 pt-3 rounded-xl bg-light">
                    <input
                      placeholder="Enter the OTP"
                      type="number"
                      id="otp"
                      value={otp}
                      onChange={(e) => handleOTP(e)}
                      className="bg-light rounded-full w-full text-gray-700 focus:outline-none focus:border-primary transition duration-500 px-3 pb-3 tracking-widest"
                    />
                  </div>

                  <div className="flex justify-between">
                    <div className="space-y-3 flex flex-col pointer">
                      <button
                        className="bg-white font-bold py-2 px-4 rounded hover:shadow-xl transition duration-200 text-primary"
                        onClick={verifyOTP}
                      >
                        Verify
                      </button>
                    </div>
                    <div className="space-y-3 flex flex-col pointer">
                      <button
                        className="bg-white font-bold py-2 px-4 rounded hover:shadow-xl transition duration-200 text-primary"
                        onClick={resendingOTP}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <div id="resendOTP-container" />
        </div>
      )}
    </div>
  );
}
