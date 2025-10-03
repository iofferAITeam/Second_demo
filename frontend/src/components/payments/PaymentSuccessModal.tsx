"use client";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckOrder?: () => void;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  onCheckOrder,
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  const handleCheckOrder = () => {
    // This would typically navigate to order page or show order details
    console.log("Navigate to order page");
    onCheckOrder?.();
    onClose();
  };

  return (
    <div className="pricing-modal-overlay">
      <div className="pricing-modal">
        <div className="payment-result-modal success-modal">
          {/* Close button */}
          <button
            className="close-button result-close-button"
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

          {/* Success Icon */}
          <div className="result-icon success-icon">
            <svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_215_7259)">
                <path
                  className="success-bar bar-1"
                  d="M43.957 17.2313C43.957 14.8985 45.8482 13.0073 48.181 13.0073C50.5139 13.0073 52.405 14.8985 52.405 17.2313V49.1753H43.957V17.2313Z"
                  fill="url(#paint0_linear_215_7259)"
                />
                <path
                  className="success-bar bar-2"
                  d="M131.605 50.2313C131.605 47.8985 133.497 46.0073 135.829 46.0073C138.162 46.0073 140.053 47.8985 140.053 50.2313V82.1753H131.605V50.2313Z"
                  fill="url(#paint1_linear_215_7259)"
                />
                <path
                  className="success-bar bar-3"
                  d="M11.75 81.6473C11.75 79.3145 13.6411 77.4233 15.974 77.4233C18.3069 77.4233 20.198 79.3145 20.198 81.6473V113.591H11.75V81.6473Z"
                  fill="url(#paint2_linear_215_7259)"
                />
                <path
                  className="success-bar bar-4"
                  d="M35.5117 104.879C35.5117 102.546 37.4029 100.655 39.7357 100.655C42.0686 100.655 43.9597 102.546 43.9597 104.879V136.823H35.5117V104.879Z"
                  fill="url(#paint3_linear_215_7259)"
                />
                <path
                  className="success-bar bar-5"
                  d="M90.1562 14.0634C90.1562 11.7305 92.0474 9.83936 94.3802 9.83936C96.7131 9.83936 98.6042 11.7305 98.6042 14.0634V46.0074H90.1562V14.0634Z"
                  fill="url(#paint4_linear_215_7259)"
                />
                <path
                  className="success-character"
                  d="M33.188 65.5072L39.3128 61.971C39.37 62.865 39.4513 63.7592 39.5551 64.6525C45.2376 60.877 48.6601 55.2844 48.7971 55.5819C56.0051 71.2343 73.0005 80.3409 74.3135 85.0511C82.3113 113.761 131.865 103.653 140.483 73.74C141.307 64.0381 139.441 49.4191 138.014 40.2891C137.743 38.5561 139.814 37.8328 140.569 39.416C145.31 49.371 152.165 67.7958 148.625 85.5906C147.827 89.5999 146.479 93.4854 144.858 97.2456L144.579 97.8849L144.264 98.5833L144.041 99.0626L143.754 99.6692L143.335 100.524L142.884 101.412L142.725 101.715L142.479 102.18L142.237 102.628L141.922 103.199L141.725 103.548L141.463 104.007L141.252 104.368L140.928 104.916L140.736 105.233L140.472 105.664L140.204 106.093L139.912 106.555L139.688 106.899L139.353 107.411L139.121 107.757L138.823 108.197C138.408 108.803 137.981 109.404 137.544 109.997L137.049 110.659L136.774 111.02L136.424 111.471L136.166 111.799L135.781 112.28L135.533 112.585L135.208 112.979L135.133 113.069C134.67 113.623 134.196 114.17 133.714 114.71L133.131 115.354L132.839 115.67L132.445 116.089L132.138 116.411L131.748 116.813L131.435 117.13L131.039 117.525L130.737 117.824L130.287 118.258L129.959 118.571L129.573 118.933L129.213 119.265L128.795 119.646L128.434 119.966L128.046 120.308L127.678 120.626L127.235 121.004L126.889 121.294L126.434 121.668L126.063 121.968L125.66 122.29L125.265 122.599L124.839 122.929C124.475 123.207 124.106 123.482 123.735 123.754L123.141 124.183L122.745 124.464L122.239 124.816L121.865 125.071L121.369 125.405L120.997 125.651L120.477 125.988L120.088 126.237L119.621 126.53L119.2 126.789L118.721 127.077C118.422 127.256 118.121 127.434 117.817 127.609C86.8817 145.47 47.3243 134.87 29.4634 103.935L29.0305 103.173L28.8529 102.854L28.6647 102.51L28.4108 102.041C28.2668 101.772 28.1253 101.501 27.9854 101.23L27.6804 100.632L27.4855 100.241L27.2138 99.6868L26.9421 99.1186L26.7784 98.7687L26.5081 98.1794C26.3346 97.7957 26.165 97.4108 25.9996 97.0252L25.6852 96.2775C25.4432 95.6933 25.2096 95.1074 24.986 94.5195L24.8986 94.2881C24.8144 94.0642 24.7315 93.8397 24.6499 93.6152L24.5644 93.3793C24.4775 93.137 24.3928 92.8943 24.309 92.6517C22.1029 86.2667 20.9571 79.6879 20.8066 73.1439C20.1598 72.1123 19.5087 71.0589 18.8571 69.9821C19.3257 69.8208 19.9738 69.7398 20.8197 69.6666C21.0236 63.0527 22.2395 56.5162 24.4058 50.2959L33.188 65.5072Z"
                  fill="#1C5DFF"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M23.8041 90.436C22.1083 85.4234 20.4809 81.5489 18.9218 78.8127L18.8398 78.6698C17.2558 75.9262 2.44995 61.9854 4.97187 47.8134L45.245 42.708C49.6364 52.0248 47.2141 56.9746 48.6397 59.4438C50.2237 62.1874 55.9159 65.7994 59.4704 69.844C63.025 73.8887 25.4998 95.4487 23.8041 90.436Z"
                  fill="#1C5DFF"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.68836 60.5129C6.68836 60.5129 22.2498 96.1951 33.9604 110.658C45.671 125.12 32.0542 94.5933 32.0542 94.5933L20.5014 74.2279L6.68836 60.5129Z"
                  fill="#1C5DFF"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.8553 69.9823C45.3778 113.809 69.6784 115.228 81.9976 115.5C107.935 116.072 147.813 93.2215 141.641 61.7065C144.824 100.541 83.3031 117.329 74.3114 85.0514C72.9993 80.3414 56.0029 71.2345 48.7947 55.5815C48.6192 55.2005 43.0553 64.4822 34.2552 67.2322C25.4551 69.9822 20.7268 69.3379 18.8553 69.9823Z"
                  fill="url(#paint5_linear_215_7259)"
                  fillOpacity="0.92"
                  stroke="#1C5DFF"
                  strokeWidth="1.584"
                  strokeLinejoin="round"
                />
                <circle
                  className="success-check-circle"
                  cx="87"
                  cy="66"
                  r="42"
                  fill="#12C848"
                />
                <path
                  className="success-checkmark"
                  d="M75 67.4186L82.9517 74L99 58"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M35.2119 106.643C35.2119 106.643 46.4374 100.365 50.847 94.1914C55.2565 88.018 55.2565 82.7265 52.1698 82.2856C49.0831 81.8446 48.2012 83.6085 44.2326 87.5771C43.1356 88.674 41.4625 89.722 39.3498 90.3374C35.0673 91.5847 32.2417 89.1733 32.2417 89.1733C32.2417 89.1733 35.2119 106.643 35.2119 106.643Z"
                  fill="#1C5DFF"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M95.0243 122.726C95.0243 122.726 92.8982 111.101 100.294 105.494C107.69 99.8873 97.4164 99.6741 100.552 97.8452C103.687 96.0164 111.441 97.8937 111.441 97.8937C111.441 97.8937 114.62 98.6897 113.539 103.264C112.873 106.08 115.615 107.322 121.413 103.131C123.148 101.877 123.405 106.884 122.281 108.831C119.355 113.9 107.967 125.52 107.967 125.52L95.0243 122.726Z"
                  fill="#1C5DFF"
                />
                <ellipse
                  className="success-character"
                  cx="25.0605"
                  cy="46.5383"
                  rx="20.592"
                  ry="14.256"
                  transform="rotate(-15 25.0605 46.5383)"
                  fill="#1C5DFF"
                />
                <ellipse
                  className="success-character"
                  cx="28.244"
                  cy="58.3548"
                  rx="2"
                  ry="3.5"
                  transform="rotate(-15 28.244 58.3548)"
                  fill="#1202AA"
                  stroke="white"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.8666 60.7919C19.7682 61.6221 16.6447 60.0118 15.8899 57.1951C15.07 54.135 19.2208 53.6816 21.014 51.9422C22.8072 50.2028 22.5067 49.4092 25.6069 48.5785C28.711 47.7468 28.8473 48.5697 31.2694 49.1754C33.3932 49.7064 37.5104 48.1221 38.3303 51.1822C39.0851 53.9989 37.1852 56.9553 34.0868 57.7855C30.9884 58.6157 28.2065 58.2803 27.4518 55.4636C28.1148 58.2407 25.9173 59.9745 22.8666 60.7919Z"
                  fill="white"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M25.6193 50.7262C25.9072 50.3702 26.3918 50.2404 26.8191 50.4047L29.7745 51.5407C30.7291 51.9077 30.6568 53.2817 29.6689 53.5464L24.7222 54.8719C23.7343 55.1366 22.9846 53.9828 23.6279 53.1877L25.6193 50.7262Z"
                  fill="black"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.437 41.9682C7.437 41.9682 2.88004 43.5692 1.26968 47.5119C3.89682 47.3639 5.17722 49.1332 5.17722 49.1332L7.02949 46.4232L7.437 41.9682Z"
                  fill="#1C5DFF"
                />
                <path
                  className="success-character"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M38.0357 33.7687C38.0357 33.7687 42.7826 32.8767 46.1486 35.486C43.7994 36.6714 43.5752 38.8439 43.5752 38.8439L40.6161 37.4231L38.0357 33.7687Z"
                  fill="#1C5DFF"
                />
                <path
                  className="success-character"
                  d="M25.1448 46.5591C29.6515 45.3515 33.8515 46.4126 33.8515 46.4126C33.8515 46.4126 29.8559 46.1144 25.3492 47.322C20.8425 48.5296 17.5312 50.7856 17.5312 50.7856C17.5312 50.7856 20.638 47.7667 25.1448 46.5591Z"
                  fill="white"
                />
                <path
                  className="success-character"
                  d="M16.6987 56.1417C16.6987 56.1417 13.9058 54.8989 8.76409 57.13"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  className="success-character"
                  d="M16.9902 57.224C16.9902 57.224 13.7879 57.5131 9.76669 60.8662"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  className="success-character"
                  d="M17.9309 58.7005C17.9309 58.7005 14.1058 59.7254 12.1541 63.6618"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  className="success-character"
                  d="M37.1015 50.6755C37.1015 50.6755 38.8988 48.2028 44.4672 47.5641"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  className="success-character"
                  d="M37.3891 51.7577C37.3891 51.7577 40.3069 50.407 45.4659 51.3003"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  className="success-character"
                  d="M37.3113 53.5075C37.3113 53.5075 41.1364 52.4826 44.7947 54.9157"
                  stroke="white"
                  strokeLinecap="round"
                />
                <g filter="url(#filter0_i_215_7259)">
                  <path
                    className="success-glasses"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.32787 51.4606C2.00873 50.2696 2.44011 49.0083 3.45747 48.3116C6.74896 46.0575 14.5284 41.1613 23.0107 38.8885C31.493 36.6157 40.6783 36.9661 44.6558 37.2725C45.8853 37.3672 46.8895 38.2438 47.2086 39.4349C47.6742 41.1723 46.2272 42.866 44.431 42.7706C39.8916 42.5296 31.9338 42.5104 24.5139 44.4986C17.094 46.4867 10.212 50.4822 6.40125 52.9607C4.89339 53.9414 2.79341 53.1981 2.32787 51.4606Z"
                    fill="url(#paint6_linear_215_7259)"
                  />
                </g>
                <path
                  className="success-glasses"
                  opacity="0.6"
                  d="M7.15613 48.0566C7.84292 47.3564 9.41179 46.359 9.94287 46.2167"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  className="success-glasses"
                  opacity="0.6"
                  d="M11.6145 45.3129C11.9121 45.1423 12.2616 44.9579 12.5891 44.8701"
                  stroke="white"
                  strokeLinecap="round"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_215_7259"
                  x1="43.957"
                  y1="13.0073"
                  x2="43.957"
                  y2="49.1753"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3CFFFD" />
                  <stop offset="1" stopColor="#1CFFFB" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_215_7259"
                  x1="131.605"
                  y1="46.0073"
                  x2="131.605"
                  y2="82.1753"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3CFFFD" />
                  <stop offset="1" stopColor="#1CFFFB" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_215_7259"
                  x1="11.75"
                  y1="77.4233"
                  x2="11.75"
                  y2="113.591"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3CFFFD" />
                  <stop offset="1" stopColor="#1CFFFB" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient
                  id="paint3_linear_215_7259"
                  x1="35.5117"
                  y1="100.655"
                  x2="35.5117"
                  y2="136.823"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3CFFFD" />
                  <stop offset="1" stopColor="#1CFFFB" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient
                  id="paint4_linear_215_7259"
                  x1="90.1562"
                  y1="9.83936"
                  x2="90.1562"
                  y2="46.0074"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3CFFFD" />
                  <stop offset="1" stopColor="#1CFFFB" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient
                  id="paint5_linear_215_7259"
                  x1="35.9976"
                  y1="67.9999"
                  x2="145.998"
                  y2="79.9999"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="paint6_linear_215_7259"
                  x1="3.76395"
                  y1="44.0456"
                  x2="6.10811"
                  y2="52.7942"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#A7FFAC" />
                  <stop offset="1" stopColor="#00BAFF" />
                </linearGradient>
                <filter
                  id="filter0_i_215_7259"
                  x="2.22266"
                  y="37.0488"
                  width="45.0742"
                  height="16.3486"
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
                    result="effect1_innerShadow_215_7259"
                  />
                </filter>
                <clipPath id="clip0_215_7259">
                  <rect width="150" height="150" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* Success Content */}
          <div className="result-content">
            <h2 className="result-title">Thank You for Your Payment!</h2>
            <p className="result-message">
              iOffer is ready to deliver exceptional service to you
            </p>
          </div>

          {/* Action Buttons */}
          <div className="result-buttons">
            <button className="result-button secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="result-button primary"
              onClick={handleCheckOrder}
            >
              Check Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
