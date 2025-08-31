export default function StaticPage() {
  return (
    <div>
      <h1>Static Test Page</h1>
      <p>This is a static page without any React hooks or data fetching.</p>
      <p>If you can see this, React is working.</p>
      
      <h2>CPU Information (Static)</h2>
      <p>Model: Intel(R) Xeon(R) Processor</p>
      <p>Cores: 2</p>
      <p>Threads: 4</p>
      <p>Architecture: x86_64</p>
      <p>Frequency: 2400.00 MHz</p>
      <p>Cache: 327680 KB</p>
      <p>Vendor: GenuineIntel</p>
      <p>Family: 6</p>
      <p>Stepping: 2</p>
    </div>
  );
}