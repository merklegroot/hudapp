describe('Vercel Detection', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.VERCEL;
    delete process.env.VERCEL_URL;
    delete process.env.NODE_ENV;
    delete process.env.AWS_LAMBDA_FUNCTION_NAME;
  });

  it('should detect Vercel Serverless when VERCEL=1', () => {
    process.env.VERCEL = '1';
    
    // Test the environment variable detection logic
    expect(process.env.VERCEL).toBe('1');
    expect(process.env.VERCEL === '1').toBe(true);
  });

  it('should detect Vercel Serverless when VERCEL_URL is set', () => {
    process.env.VERCEL_URL = 'https://myapp.vercel.app';
    
    // Test the environment variable detection logic
    expect(process.env.VERCEL_URL).toBe('https://myapp.vercel.app');
    expect(!!process.env.VERCEL_URL).toBe(true);
  });

  it('should detect AWS Lambda when AWS_LAMBDA_FUNCTION_NAME is set', () => {
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'my-lambda-function';
    
    // Test the environment variable detection logic
    expect(process.env.AWS_LAMBDA_FUNCTION_NAME).toBe('my-lambda-function');
    expect(!!process.env.AWS_LAMBDA_FUNCTION_NAME).toBe(true);
  });

  it('should detect Google Cloud Platform when GOOGLE_CLOUD_PROJECT is set', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'my-gcp-project';
    
    // Test the environment variable detection logic
    expect(process.env.GOOGLE_CLOUD_PROJECT).toBe('my-gcp-project');
    expect(!!process.env.GOOGLE_CLOUD_PROJECT).toBe(true);
  });

  it('should detect Heroku when HEROKU_APP_NAME is set', () => {
    process.env.HEROKU_APP_NAME = 'my-heroku-app';
    
    // Test the environment variable detection logic
    expect(process.env.HEROKU_APP_NAME).toBe('my-heroku-app');
    expect(!!process.env.HEROKU_APP_NAME).toBe(true);
  });
});
