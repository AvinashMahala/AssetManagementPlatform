const swaggerUiOptions = {
  customCss: `
    /* Hide default topbar */
    .swagger-ui .topbar {
      display: none;
    }

    /* Enhanced title styling with logo */
    .swagger-ui .info .title {
      color: #2c3e50;
      font-size: 36px;
      font-weight: bold;
      background: url('https://via.placeholder.com/50x50/3498db/ffffff?text=AMP') no-repeat left center;
      padding-left: 70px;
      line-height: 50px;
      margin-bottom: 10px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    /* Enhanced description */
    .swagger-ui .info .description {
      font-size: 16px;
      line-height: 1.6;
      color: #34495e;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }

    /* Contact info styling */
    .swagger-ui .info .contact {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border: 1px solid #dee2e6;
    }

    /* License styling */
    .swagger-ui .info .license {
      background: #e8f5e8;
      padding: 10px;
      border-radius: 5px;
      display: inline-block;
      margin: 10px 0;
    }

    /* Scheme container */
    .swagger-ui .scheme-container {
      background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    /* Tag styling */
    .swagger-ui .opblock-tag {
      font-size: 18px;
      font-weight: 600;
      color: #2980b9;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 12px 15px;
      border-radius: 8px;
      margin: 10px 0;
      border-left: 4px solid #3498db;
      transition: all 0.3s ease;
    }
    .swagger-ui .opblock-tag:hover {
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      transform: translateX(5px);
    }

    /* Method badges */
    .swagger-ui .opblock-summary-method {
      background: #27ae60;
      color: white;
      font-weight: bold;
      padding: 6px 12px;
      border-radius: 4px;
      text-transform: uppercase;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .swagger-ui .opblock-summary-method[data-method="post"] { background: #3498db; }
    .swagger-ui .opblock-summary-method[data-method="put"] { background: #f39c12; }
    .swagger-ui .opblock-summary-method[data-method="delete"] { background: #e74c3c; }
    .swagger-ui .opblock-summary-method[data-method="patch"] { background: #9b59b6; }

    /* Button styling */
    .swagger-ui .btn {
      background-color: #3498db;
      border-color: #3498db;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .swagger-ui .btn:hover {
      background-color: #2980b9;
      border-color: #2980b9;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      border: none;
    }
    .swagger-ui .btn.execute:hover {
      background: linear-gradient(135deg, #229954 0%, #27ae60 100%);
    }

    /* Response status colors */
    .swagger-ui .response-col_status {
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .swagger-ui .response-col_status[data-status="200"] {
      color: #27ae60;
      background: #d5f4e6;
    }
    .swagger-ui .response-col_status[data-status="201"] {
      color: #27ae60;
      background: #d5f4e6;
    }
    .swagger-ui .response-col_status[data-status="400"],
    .swagger-ui .response-col_status[data-status="500"] {
      color: #e74c3c;
      background: #fadbd8;
    }
    .swagger-ui .response-col_status[data-status="401"] {
      color: #f39c12;
      background: #fdeaa7;
    }
    .swagger-ui .response-col_status[data-status="403"] {
      color: #e74c3c;
      background: #fadbd8;
    }
    .swagger-ui .response-col_status[data-status="404"] {
      color: #95a5a6;
      background: #ecf0f1;
    }

    /* Parameter table styling */
    .swagger-ui .parameters {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin: 10px 0;
    }

    /* Code blocks */
    .swagger-ui .highlight-code {
      background: #2c3e50 !important;
      border-radius: 6px;
      border: 1px solid #34495e;
    }

    /* Model examples */
    .swagger-ui .model-example {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
    }

    /* Loading animation */
    .swagger-ui .loading-container {
      background: rgba(255,255,255,0.9);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    /* Error styling */
    .swagger-ui .error {
      background: #fadbd8;
      border: 1px solid #e74c3c;
      border-radius: 6px;
      padding: 10px;
      color: #721c24;
    }

    /* Success styling */
    .swagger-ui .success {
      background: #d5f4e6;
      border: 1px solid #27ae60;
      border-radius: 6px;
      padding: 10px;
      color: #155724;
    }

    /* Tab navigation */
    .swagger-ui .tab {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px 6px 0 0;
      padding: 10px 15px;
      margin-right: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .swagger-ui .tab.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    /* Search/filter styling */
    .swagger-ui .filter {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 8px 12px;
      width: 100%;
      margin-bottom: 15px;
    }

    /* Scrollbar styling */
    .swagger-ui ::-webkit-scrollbar {
      width: 8px;
    }
    .swagger-ui ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    .swagger-ui ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    .swagger-ui ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `,
  customSiteTitle: 'Asset Management Platform API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    // Add a named OpenAPI URL so the UI shows a link / selector for the raw spec
    // This points to the route we will expose at `/openapi.json`.
    urls: [
      { name: 'OpenAPI (JSON)', url: '/openapi.json' }
    ],
    displayRequestDuration: true,
    // Always sort tags/groups alphabetically (ascending)
    tagsSorter: 'alpha',
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add any custom request interceptors if needed
      return req;
    },
    responseInterceptor: (res: any) => {
      // Add any custom response interceptors if needed
      return res;
    },
    onComplete: () => {
      // Custom initialization code
      console.log('Swagger UI loaded successfully');
    },
    syntaxHighlight: {
      activate: true,
      theme: 'arta'
    },
    validatorUrl: null // Disable online validator
  }
};

export default swaggerUiOptions;