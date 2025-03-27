import { useRef, forwardRef } from 'react';

// In React 19, function components can still accept ref via forwardRef
// but you can use ref as a prop in standard HTML elements and forwardRef components
const RefForwardedButton = forwardRef(function RefForwardedButton(props, ref) {
  return (
    <button 
      ref={ref} 
      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
      {...props}
    >
      {props.children}
    </button>
  );
});

// No need to use forwardRef anymore but included as a comparison
const LegacyButton = forwardRef((props, ref) => {
  return (
    <button 
      ref={ref} 
      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      {...props}
    >
      {props.children}
    </button>
  );
});

export default function RefExample() {
  const modernRef = useRef(null);
  const legacyRef = useRef(null);
  
  function logRefs() {
    console.log('Modern button ref:', modernRef.current);
    console.log('Legacy button ref:', legacyRef.current);
  }
  
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-3">React 19 Ref Features</h2>
      
      <div className="flex flex-col space-y-3">
        <RefForwardedButton ref={modernRef} onClick={logRefs}>
          React 19 Direct Ref Button
        </RefForwardedButton>
        
        <LegacyButton ref={legacyRef} onClick={logRefs}>
          Legacy forwardRef Button  
        </LegacyButton>
        
        <p className="text-sm text-gray-600">
          Click any button to log the refs to the console
        </p>
      </div>
    </div>
  );
} 