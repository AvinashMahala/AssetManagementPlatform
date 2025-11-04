import swaggerJSDoc from 'swagger-jsdoc';
import options from './options.js';
import swaggerUiOptions from './ui.js';

// Generate swagger specs
const specs = swaggerJSDoc(options);

// Export both specs and UI options
export { specs, swaggerUiOptions };
export default specs;