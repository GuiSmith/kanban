import React from 'react';

const Loading = ({ size = 64, className = '', label = 'Carregando...' }) => {
  return (
    <div
      className={`fixed inset-0 z-50 inline-flex items-center justify-center text-sky-600 ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role='status'
      aria-live='polite'
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 120 120'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle
          cx='60'
          cy='60'
          r='42'
          stroke='currentColor'
          strokeWidth='10'
          strokeLinecap='round'
          strokeDasharray='160 120'
        >
          <animateTransform
            attributeName='transform'
            type='rotate'
            from='0 60 60'
            to='360 60 60'
            dur='1s'
            repeatCount='indefinite'
          />
        </circle>
      </svg>
      {/* <span className='sr-only'>{label}</span> */}
    </div>
  );
};

export default Loading;

