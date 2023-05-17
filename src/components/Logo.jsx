import styles from "@/styles/Logo.module.css";

export function Logo() {
  return (
    <svg className={styles.logo} viewBox="0 0 434 167" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_172_875)">
        <mask id="mask0_172_875" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="434" height="167">
          <path d="M434 0H0V167H434V0Z" fill="white"/>
        </mask>
        <g mask="url(#mask0_172_875)">
          <path d="M86.0699 127V34.8401H102.454V127H86.0699ZM143.003 128.536C135.067 128.536 128.923 126.061 124.571 121.112C120.304 116.163 118.171 108.909 118.171 99.3521V63.5121H134.427V97.8161C134.427 103.277 135.536 107.459 137.755 110.36C139.974 113.261 143.472 114.712 148.251 114.712C152.774 114.712 156.486 113.091 159.387 109.848C162.374 106.605 163.867 102.083 163.867 96.2801V63.5121H180.251V127H165.787L164.507 116.248C162.544 120.003 159.686 122.989 155.931 125.208C152.262 127.427 147.952 128.536 143.003 128.536ZM197.07 127V63.5121H211.662L213.198 75.4161C215.502 71.3201 218.617 68.0774 222.542 65.6881C226.553 63.2134 231.246 61.9761 236.622 61.9761V79.2561H232.014C228.43 79.2561 225.23 79.8108 222.414 80.9201C219.598 82.0294 217.379 83.9494 215.758 86.6801C214.222 89.4108 213.454 93.2081 213.454 98.0721V127H197.07ZM247.82 127V63.5121H262.412L263.948 75.4161C266.252 71.3201 269.367 68.0774 273.292 65.6881C277.303 63.2134 281.996 61.9761 287.372 61.9761V79.2561H282.764C279.18 79.2561 275.98 79.8108 273.164 80.9201C270.348 82.0294 268.129 83.9494 266.508 86.6801C264.972 89.4108 264.204 93.2081 264.204 98.0721V127H247.82ZM307.402 53.6561C304.415 53.6561 301.941 52.7601 299.978 50.9681C298.101 49.1761 297.162 46.9148 297.162 44.1841C297.162 41.4534 298.101 39.2348 299.978 37.5281C301.941 35.7361 304.415 34.8401 307.402 34.8401C310.389 34.8401 312.821 35.7361 314.698 37.5281C316.661 39.2348 317.642 41.4534 317.642 44.1841C317.642 46.9148 316.661 49.1761 314.698 50.9681C312.821 52.7601 310.389 53.6561 307.402 53.6561ZM299.21 127V63.5121H315.594V127H299.21ZM363.543 128.536C357.143 128.536 351.468 127.171 346.519 124.44C341.57 121.709 337.687 117.869 334.871 112.92C332.055 107.971 330.647 102.253 330.647 95.7681C330.647 89.1974 332.012 83.3521 334.743 78.2321C337.559 73.1121 341.399 69.1441 346.263 66.3281C351.212 63.4268 357.015 61.9761 363.671 61.9761C369.9 61.9761 375.404 63.3414 380.183 66.0721C384.962 68.8028 388.674 72.5574 391.319 77.3361C394.05 82.0294 395.415 87.2774 395.415 93.0801C395.415 94.0188 395.372 95.0001 395.287 96.0241C395.287 97.0481 395.244 98.1148 395.159 99.2241H346.903C347.244 104.173 348.951 108.056 352.023 110.872C355.18 113.688 358.978 115.096 363.415 115.096C366.743 115.096 369.516 114.371 371.735 112.92C374.039 111.384 375.746 109.421 376.855 107.032H393.495C392.3 111.043 390.295 114.712 387.479 118.04C384.748 121.283 381.335 123.843 377.239 125.72C373.228 127.597 368.663 128.536 363.543 128.536ZM363.671 75.2881C359.66 75.2881 356.119 76.4401 353.047 78.7441C349.975 80.9628 348.012 84.3761 347.159 88.9841H378.775C378.519 84.8028 376.983 81.4748 374.167 79.0001C371.351 76.5254 367.852 75.2881 363.671 75.2881ZM409.195 127V34.8401H425.579V127H409.195Z" className={styles.foreground_color} />
          <path d="M8.70398 37.4001V127H25.088V92.3121H41.856C49.1947 92.3121 55.2107 91.0748 59.904 88.6001C64.5973 86.0401 68.0533 82.7121 70.272 78.6161C72.4907 74.4348 73.6 69.8694 73.6 64.9201C73.6 59.7148 72.448 55.0214 70.144 50.8401C67.84 46.6588 64.3413 43.3734 59.648 40.9841C54.9547 38.5948 49.024 37.4001 41.856 37.4001H8.70398Z" className={styles.accent_color} />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_172_875">
          <rect width="434" height="167" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
}