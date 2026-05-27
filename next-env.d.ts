/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Ensures the browser understands window.ethereum safely
interface Window {
  ethereum?: any;
}
