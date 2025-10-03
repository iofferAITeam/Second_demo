"use client";

import { useState } from "react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayment?: () => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  onPayment,
}: PricingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing with random result
    setTimeout(() => {
      setIsProcessing(false);
      // Generate random boolean for payment result (simulating backend response)
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      onPayment?.();
    }, 2000);
  };

  const features = [
    "Smart and agile study abroad Q&A",
    "Exclusive competitiveness analysis",
    "Extensive school database & application resources",
    "Personalized university matching",
  ];

  const benefits = [
    "Unlimited AI Conversations",
    "Personalized School Fit Analysis",
    "Admission Rate Predictions",
    "In-Depth Strategy Guidance to Enhance Competitiveness",
  ];

  return (
    <div className="pricing-modal-overlay">
      <div className="pricing-modal">
        {/* Header */}
        <div className="pricing-modal-header">
          <h1 className="pricing-modal-title">Pricing</h1>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              className="close-icon"
              strokeWidth={2}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M6 6L18 18M6 18L18 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="pricing-content">
          {/* Left Side - Company Info */}
          <div className="pricing-left">
            {/* Icon */}
            <div className="pricing-icon">
              <svg
                width="140"
                height="141"
                viewBox="0 0 140 141"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="logo-svg"
              >
                <g clipPath="url(#clip0_215_7218)">
                  <ellipse
                    cx="45.5"
                    cy="31.5"
                    rx="45.5"
                    ry="31.5"
                    transform="matrix(-1 0 0 1 107.334 22.6665)"
                    fill="#1C5DFF"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M107.335 54.1665H16.3353C16.3353 80.9998 16.3353 105.5 16.3353 133.5H102.085C102.085 133.5 110.252 87.4165 110.252 76.9165C110.252 66.4165 107.335 54.1665 107.335 54.1665Z"
                    fill="#1C5DFF"
                  />
                  <path
                    opacity="0.6"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M101.502 93.8335C101.502 93.8335 89.252 99.8447 71.1686 99.8447C53.0853 99.8447 40.8353 93.8335 40.8353 93.8335C40.8353 93.8335 44.1674 122.53 44.76 142.545C57.0014 141.559 97.9342 140.245 99.4472 138.139C100.04 118.126 101.502 93.8335 101.502 93.8335Z"
                    fill="url(#paint0_linear_215_7218)"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M84.0007 83.3335C91.0883 83.3335 95.084 78.1102 95.084 71.6668C95.084 64.6668 87.7157 66.0729 82.8937 63.386C78.0717 60.6992 79.334 58.8335 73.5007 58.8335C66.4 58.8335 66.5796 60.6679 61.7566 63.3456C57.5274 65.6936 47.834 64.6668 47.834 71.6668C47.834 78.1102 53.5797 83.3335 60.6673 83.3335C67.755 83.3335 73.5007 81.0268 73.5007 74.5835C73.6737 80.8898 77.022 83.3335 84.0007 83.3335Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M74.7507 63.333C74.0203 62.7487 72.9824 62.7487 72.2519 63.333L66.2868 68.1051C64.8105 69.2861 65.6456 71.6668 67.5362 71.6668H79.4664C81.357 71.6668 82.1921 69.2861 80.7158 68.1051L74.7507 63.333Z"
                    fill="black"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M93.3346 33.1665C93.3346 33.1665 103.976 33.9775 109.668 41.4716C103.976 42.658 102.255 47.1665 102.255 47.1665C102.255 47.1665 96.7521 42.4418 96.7521 42.4418L93.3346 33.1665Z"
                    fill="#1C5DFF"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M29.1673 34.3335C29.1673 34.3335 18.5258 35.1445 12.834 42.6386C18.5258 43.825 20.2467 48.3335 20.2467 48.3335C20.2467 48.3335 25.7498 43.6088 25.7498 43.6088L29.1673 34.3335Z"
                    fill="#1C5DFF"
                  />
                  <path
                    d="M72.334 54.1668C62.0247 54.1668 52.5006 58.8335 52.5006 58.8335C52.5006 58.8335 62.0247 55.912 72.334 55.912C82.6433 55.912 89.834 58.8335 89.834 58.8335C89.834 58.8335 82.6433 54.1668 72.334 54.1668Z"
                    fill="white"
                  />
                  <path
                    d="M94.502 69.8821C94.502 69.8821 99.752 65.6325 112.002 67.4537"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M94.502 72.3581C94.502 72.3581 101.502 71.1439 112.002 76.0006"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M93.3353 76.0483C93.3353 76.0483 102.085 76.0483 108.502 83.3335"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50.168 69.8821C50.168 69.8821 44.918 65.6325 32.668 67.4537"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50.168 72.3581C50.168 72.3581 43.168 71.1439 32.668 76.0006"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    d="M51.3346 76.0483C51.3346 76.0483 42.5846 76.0483 36.168 83.3335"
                    stroke="white"
                    strokeLinecap="round"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M74.2464 82.3284C73.5065 81.7243 72.3829 81.6942 71.6391 82.2934C71.5323 82.3794 71.4174 82.4669 71.2936 82.5557C70.3365 83.2429 69.0793 83.8489 67.9666 84.3137C67.0992 84.676 67.0927 85.8979 68.0023 86.1351C69.3854 86.4958 71.152 86.8335 72.9186 86.8335C74.7339 86.8335 76.5492 86.477 77.9484 86.1053C78.8438 85.8674 78.8452 84.6822 77.9896 84.3268C76.792 83.8294 75.4307 83.1926 74.5436 82.5557C74.438 82.4799 74.339 82.404 74.2464 82.3284Z"
                    fill="white"
                  />
                  <g filter="url(#filter0_i_215_7218)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M113.248 50.0103C113.127 47.577 111.558 45.4673 109.225 44.7648C101.049 42.3028 81.0001 37.0609 61.2588 38.0382C41.5174 39.0155 22.084 46.212 14.1914 49.4695C11.9394 50.399 10.5861 52.6534 10.7066 55.0867L10.7737 56.4426C10.9494 59.9923 14.6922 62.2998 18.0062 61.0161C27.2129 57.4498 44.4327 51.7202 61.8933 50.8558C79.3539 49.9914 97.0554 53.9922 106.569 56.6317C109.994 57.5818 113.49 54.9159 113.315 51.3662L113.248 50.0103Z"
                      fill="url(#paint1_linear_215_7218)"
                    />
                  </g>
                  <path
                    opacity="0.6"
                    d="M100.813 46.5927C98.8942 45.5847 94.9192 44.5483 93.7058 44.6083"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    opacity="0.6"
                    d="M89.5794 43.8387C88.8381 43.6813 87.9781 43.5298 87.2298 43.5669"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M123.666 22.667C123.666 27.1772 120.009 30.833 115.499 30.833C120.009 30.833 123.666 34.4897 123.666 39C123.666 34.4898 127.322 30.8332 131.832 30.833C127.322 30.8328 123.666 27.1771 123.666 22.667Z"
                    fill="#1C5DFF"
                  />
                  <path
                    d="M105.001 6.33301C105.001 10.7023 101.57 14.2704 97.2549 14.4893L96.834 14.5C101.344 14.5 105.001 18.1567 105.001 22.667C105.001 18.1567 108.658 14.5 113.168 14.5C108.658 14.5 105.001 10.8433 105.001 6.33301Z"
                    fill="#1C5DFF"
                  />
                  <path
                    d="M125.24 90.9168C123.296 87.4168 119.99 88.5835 117.074 86.8335C114.573 85.3329 115.324 83.3335 110.074 83.3335C106.71 83.3335 106.574 87.4168 107.157 90.9168C107.355 92.5971 102.407 91.5002 102.083 95.5835C101.805 99.0835 106.869 99.2558 106.545 100.833C103.621 115.038 93.1844 130.527 88.4902 133.5L119.407 133.5C122.324 133.5 128.062 95.9961 125.24 90.9168Z"
                    fill="#1C5DFF"
                    stroke="url(#paint2_linear_215_7218)"
                    strokeWidth="2"
                  />
                  <path
                    d="M26.2497 90.9168C28.1942 87.4168 31.4997 88.5835 34.4164 86.8335C36.9174 85.3329 36.1664 83.3335 41.4164 83.3335C44.7799 83.3335 44.9164 87.4168 44.333 90.9168C44.1354 92.5971 49.0826 91.5002 49.4069 95.5835C49.6849 99.0835 44.6205 99.2558 44.9453 100.833C40.2498 117.167 43.1389 130.527 47.8331 133.5L16.3331 133.5C17.0128 133.5 23.4278 95.9961 26.2497 90.9168Z"
                    fill="#1C5DFF"
                    stroke="url(#paint3_linear_215_7218)"
                    strokeWidth="2"
                  />
                  <g filter="url(#filter1_d_215_7218)">
                    <mask
                      id="mask0_215_7218"
                      className="alpha-mask"
                      maskUnits="userSpaceOnUse"
                      x="54"
                      y="67"
                      width="46"
                      height="42"
                    >
                      <path
                        d="M87.4993 67H66.4994L54.8327 82.1667L76.9993 109L99.166 82.1667L87.4993 67Z"
                        fill="#D9D9D9"
                      />
                    </mask>
                    <g mask="url(#mask0_215_7218)">
                      <path
                        d="M87.4993 67H66.4994L54.8327 82.1667L76.9993 109L99.166 82.1667L87.4993 67Z"
                        fill="#FFD41C"
                      />
                      <rect
                        width="44.3333"
                        height="15.1667"
                        transform="matrix(-1 0 0 1 99.166 67)"
                        fill="#FFDE72"
                      />
                      <path
                        d="M88.666 82.1665H65.3327L76.9993 109L88.666 82.1665Z"
                        fill="#FFC21C"
                      />
                      <path
                        d="M99.166 67H76.9993L88.666 82.1667H99.166V67Z"
                        fill="#FFF1AD"
                      />
                      <path
                        d="M99.166 67H76.9993L88.666 82.1667H99.166V67Z"
                        fill="url(#paint4_radial_215_7218)"
                      />
                      <path
                        d="M99.166 109H76.9993L88.666 82.1667H99.166V109Z"
                        fill="#FFD861"
                      />
                      <path
                        d="M99.166 109H76.9993L88.666 82.1667H99.166V109Z"
                        fill="url(#paint5_linear_215_7218)"
                        fillOpacity="0.2"
                      />
                      <path
                        d="M99.166 109H76.9993L88.666 82.1667H99.166V109Z"
                        fill="url(#paint6_linear_215_7218)"
                      />
                      <path
                        d="M54.834 109H77.0006L65.334 82.1667H54.834V109Z"
                        fill="#F3AA19"
                      />
                      <path
                        d="M54.834 109H77.0006L65.334 82.1667H54.834V109Z"
                        fill="url(#paint7_linear_215_7218)"
                      />
                      <path
                        d="M54.834 67H77.0006L65.334 82.1667H54.834V67Z"
                        fill="#FFC72E"
                      />
                      <path
                        d="M54.834 67H77.0006L65.334 82.1667H54.834V67Z"
                        fill="url(#paint8_linear_215_7218)"
                        fillOpacity="0.2"
                      />
                      <mask
                        id="mask1_215_7218"
                        className="alpha-mask"
                        maskUnits="userSpaceOnUse"
                        x="65"
                        y="82"
                        width="24"
                        height="27"
                      >
                        <path
                          d="M88.666 82.1665H65.3327L76.9993 109L88.666 82.1665Z"
                          fill="#171717"
                        />
                      </mask>
                      <g mask="url(#mask1_215_7218)">
                        <g opacity="0.6" filter="url(#filter2_f_215_7218)">
                          <rect
                            width="26.8899"
                            height="2.33333"
                            transform="matrix(-0.638973 -0.769229 -0.769229 0.638973 80.9492 103.093)"
                            fill="white"
                          />
                        </g>
                        <g opacity="0.6" filter="url(#filter3_f_215_7218)">
                          <rect
                            width="28.3543"
                            height="0.890945"
                            transform="matrix(-0.638973 -0.769229 -0.769229 0.638973 82.8359 100.771)"
                            fill="white"
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_i_215_7218"
                    x="10.6992"
                    y="37.9185"
                    width="102.621"
                    height="23.4565"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite
                      in2="hardAlpha"
                      operator="arithmetic"
                      k2="-1"
                      k3="1"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.880982 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="shape"
                      result="effect1_innerShadow_215_7218"
                    />
                  </filter>
                  <filter
                    id="filter1_d_215_7218"
                    x="42.832"
                    y="55"
                    width="68.334"
                    height="66"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset />
                    <feGaussianBlur stdDeviation="6" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.52 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_215_7218"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_215_7218"
                      result="shape"
                    />
                  </filter>
                  <filter
                    id="filter2_f_215_7218"
                    x="60.4727"
                    y="80.9082"
                    width="21.9766"
                    height="25.1753"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="0.75"
                      result="effect1_foregroundBlur_215_7218"
                    />
                  </filter>
                  <filter
                    id="filter3_f_215_7218"
                    x="62.5332"
                    y="77.46"
                    width="21.8027"
                    height="25.3804"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feGaussianBlur
                      stdDeviation="0.75"
                      result="effect1_foregroundBlur_215_7218"
                    />
                  </filter>
                  <linearGradient
                    id="paint0_linear_215_7218"
                    x1="88.0853"
                    y1="83.3335"
                    x2="89.252"
                    y2="128.833"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_215_7218"
                    x1="105.233"
                    y1="35.8612"
                    x2="106.222"
                    y2="55.8494"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#A7FFAC" />
                    <stop offset="1" stopColor="#00BAFF" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear_215_7218"
                    x1="107.157"
                    y1="80.7754"
                    x2="99.3701"
                    y2="121.255"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.430043" stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient
                    id="paint3_linear_215_7218"
                    x1="44.3331"
                    y1="80.7754"
                    x2="52.1199"
                    y2="121.255"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0.430043" stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0.01" />
                  </linearGradient>
                  <radialGradient
                    id="paint4_radial_215_7218"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(87.4993 66.7083) rotate(111.801) scale(9.42404 13.7736)"
                  >
                    <stop stopColor="white" stopOpacity="0.44" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient
                    id="paint5_linear_215_7218"
                    x1="86.916"
                    y1="97.3333"
                    x2="83.1243"
                    y2="95.2917"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" stopOpacity="0" />
                    <stop offset="1" stopColor="white" stopOpacity="0.32" />
                  </linearGradient>
                  <linearGradient
                    id="paint6_linear_215_7218"
                    x1="88.3743"
                    y1="89.1667"
                    x2="76.9993"
                    y2="109"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" stopOpacity="0" />
                    <stop offset="1" stopColor="white" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient
                    id="paint7_linear_215_7218"
                    x1="70.2923"
                    y1="93.8333"
                    x2="65.9173"
                    y2="96.4583"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" stopOpacity="0" />
                    <stop offset="1" stopColor="white" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient
                    id="paint8_linear_215_7218"
                    x1="67.6673"
                    y1="79.5417"
                    x2="59.5007"
                    y2="75.75"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="white" stopOpacity="0" />
                    <stop offset="1" stopColor="white" />
                  </linearGradient>
                  <clipPath id="clip0_215_7218">
                    <rect
                      width="140"
                      height="140"
                      fill="white"
                      transform="matrix(-1 0 0 1 140 0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* Content Container - Title and Features */}
            <div className="pricing-content-container">
              <h2 className="pricing-subtitle">
                Get the Strongest Support from iOFFER!
              </h2>

              {/* Features List */}
              <div className="features-list">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon">
                      <svg
                        width="24"
                        height="20"
                        viewBox="0 0 24 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.2627 16.5215C15.5778 16.8565 16.4935 16.7119 16.5078 16.7148C17.6914 18.8554 17.0784 19.1905 17.0674 19.1963C14.3529 20.7129 7.54311 19.7214 6.99219 19.1533C6.58987 18.7407 7.63574 16.709 7.63574 16.709C8.03234 17.024 8.89981 16.5252 8.90625 16.5215C9.39876 17.1235 11.0505 16.7197 11.0703 16.7148C12.0014 17.5428 13.078 16.7305 13.0986 16.7148C14.0668 17.1623 15.2485 16.5291 15.2627 16.5215ZM11.7139 0.0507812C11.7139 0.0507812 15.7247 -1.11099 14.6406 7.68066C13.5607 16.4686 11.9893 16.0967 11.9893 16.0967C9.76186 15.3716 8.92783 5.33816 9.2793 2.75391C9.62836 0.187555 11.6854 0.052526 11.7139 0.0507812ZM4.01953 2.78418C5.67112 0.349942 7.92383 2.39746 7.92383 2.39746C7.15316 9.13402 9.95703 15.9395 9.95703 15.9395C7.09002 15.1266 2.44839 5.10002 4.01953 2.78418ZM16.0674 2.39746C16.0674 2.39746 18.3211 0.353318 19.9727 2.78418C21.548 5.09997 16.9064 15.126 14.0352 15.9395C14.0504 15.9024 16.836 9.11564 16.0674 2.39746ZM0.0214844 7.99902C-0.269142 4.57838 2.4607 5.40599 2.49023 5.41504C2.69371 9.61728 7.26334 15.6826 7.26758 15.6826C5.45929 15.0768 0.313736 11.4383 0.0214844 7.99902ZM21.5049 5.41504C21.5049 5.41504 24.2707 4.55978 23.9785 7.99902C23.6863 11.4421 18.5407 15.0768 16.7324 15.6826C16.7324 15.6826 21.2972 9.61727 21.5049 5.41504Z"
                          fill="#1C5DFF"
                        />
                      </svg>
                    </div>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Pricing Card */}
          <div className="pricing-right">
            {/* Price */}
            <div className="price-section">
              <span className="currency">$</span>
              <span className="amount">9.90</span>
            </div>

            {/* Benefits */}
            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="check-icon"
                  >
                    <path
                      d="M3 8.44444L6.07692 12L13 4"
                      stroke="#1C5DFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="benefit-text">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Pay Now Button */}
            <button
              className={`pay-button ${isProcessing ? "processing" : ""}`}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>

        {/* Footer Terms */}
        <div className="payment-terms">
          <h3 className="terms-title">Payment Service Terms</h3>
          <ul className="terms-list">
            <li className="terms-item">
              Upon successful subscription, you will receive the corresponding
              service quota and benefits, valid for one month. Unused quota will
              not roll over to the next cycle.
            </li>
            <li className="terms-item">
              If your subscription remains unchanged, the next billing cycle
              will be charged automatically. Successful payment will extend your
              service; failed payment will downgrade your plan to the free tier.
            </li>
            <li className="terms-item">
              You may cancel your subscription at any time. The remaining quota
              for the current month will remain valid until expiry, and no
              charges will be made in the following month.
            </li>
            <li className="terms-item">
              You may upgrade your subscription at any time. Once payment is
              successful, the upgrade takes effect immediately, and any unused
              quota will be added to the new plan&apos;s quota. The subscription
              period will be extended by one month starting from today.
            </li>
            <li className="terms-item">
              For any inquiries, please contact us at:{" "}
              <span className="contact-email">iofferpublic@gmail.com.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
