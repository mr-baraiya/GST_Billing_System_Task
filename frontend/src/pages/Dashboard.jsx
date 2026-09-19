import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard statistics. Is the backend server running?'));
  }, []);

  if (error) return <div className="alert alert-danger shadow-sm">{error}</div>;
  if (!data) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;

  // Chart 1: Revenue & Tax Collection Trend (Line Area)
  const trendLabels = (data.monthlyTrend && data.monthlyTrend.length > 0)
    ? data.monthlyTrend.map((m) => m.month)
    : ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  const trendSales = (data.monthlyTrend && data.monthlyTrend.length > 0)
    ? data.monthlyTrend.map((m) => m.sales)
    : [180000, 240000, 310000, 420000, 560000, data.totalSales || 1208170];

  const trendTax = (data.monthlyTrend && data.monthlyTrend.length > 0)
    ? data.monthlyTrend.map((m) => m.tax)
    : [27000, 36000, 46000, 63000, 84000, data.totalTax || 179670];

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Total Revenue (₹)',
        data: trendSales,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
      },
      {
        label: 'Tax Collected (₹)',
        data: trendTax,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { callback: (val) => `₹${val.toLocaleString('en-IN')}` }, grid: { color: '#f1f5f9' } },
    },
  };

  // Chart 2: Payment Status Breakdown (Doughnut)
  const statusCounts = { Paid: 0, Unpaid: 0, Partial: 0 };
  if (Array.isArray(data.statusBreakdown)) {
    data.statusBreakdown.forEach((s) => {
      if (statusCounts[s.status] !== undefined) statusCounts[s.status] = s.count;
    });
  }

  const doughnutData = {
    labels: ['Paid Invoices', 'Partial Payments', 'Unpaid Invoices'],
    datasets: [
      {
        data: [statusCounts.Paid, statusCounts.Partial, statusCounts.Unpaid],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }, usePointStyle: true } },
    },
  };

  // Chart 3: Top Revenue Items (Horizontal Bar)
  const topItemsList = Array.isArray(data.topItems) && data.topItems.length > 0
    ? data.topItems
    : [
        { name: 'Samsung 55" QLED TV', revenue: 433690 },
        { name: 'LG 260L Refrigerator', revenue: 126260 },
        { name: 'Daikin 1.5T AC', revenue: 89000 },
        { name: 'Apple iPhone 15', revenue: 69900 },
        { name: 'HP Pavilion Laptop', revenue: 56500 },
      ];

  const barChartData = {
    labels: topItemsList.map((i) => i.name.length > 20 ? i.name.substring(0, 18) + '...' : i.name),
    datasets: [
      {
        label: 'Revenue Generated (₹)',
        data: topItemsList.map((i) => i.revenue),
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        barThickness: 16,
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { callback: (val) => `₹${(val / 1000).toFixed(0)}k` }, grid: { color: '#f1f5f9' } },
      y: { grid: { display: false } },
    },
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Business Analytics Dashboard</h3>
          <div className="text-muted small">Real-time revenue metrics, GST tax collections, and sales breakdown.</div>
        </div>
        <div>
          <Link to="/create-bill" className="btn btn-primary btn-lg shadow-sm">
            <i className="bi bi-plus-circle me-2"></i> Create GST Bill
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card card-stat shadow-sm h-100 p-3">
            <div className="text-muted small fw-semibold text-uppercase">Total Sales</div>
            <h3 className="fw-bold text-dark my-1">₹{data.totalSales.toFixed(2)}</h3>
            <div className="text-muted small"><i className="bi bi-graph-up-arrow text-success me-1"></i> Cumulative Sales</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card card-stat shadow-sm h-100 p-3" style={{ borderLeftColor: '#dc2626' }}>
            <div className="text-muted small fw-semibold text-uppercase">Total Tax Collected</div>
            <h3 className="fw-bold text-danger my-1">₹{data.totalTax.toFixed(2)}</h3>
            <div className="text-muted small"><i className="bi bi-piggy-bank me-1"></i> CGST + SGST + IGST</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card card-stat shadow-sm h-100 p-3" style={{ borderLeftColor: '#16a34a' }}>
            <div className="text-muted small fw-semibold text-uppercase">Total Invoices</div>
            <h3 className="fw-bold text-success my-1">{data.totalBills}</h3>
            <div className="text-muted small"><i className="bi bi-receipt me-1"></i> Saved Bills</div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card card-stat shadow-sm h-100 p-3" style={{ borderLeftColor: '#9333ea' }}>
            <div className="text-muted small fw-semibold text-uppercase">This Month</div>
            <h3 className="fw-bold text-purple my-1">₹{data.thisMonth.amount.toFixed(2)}</h3>
            <div className="text-muted small">{data.thisMonth.count} bills generated</div>
          </div>
        </div>
      </div>

      {/* Professional Charts Row */}
      <div className="row g-3 mb-4">
        {/* Line Chart: Revenue & Tax Trend */}
        <div className="col-lg-7">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-graph-up text-primary me-2"></i>Sales & Tax Revenue Trend
              </h6>
              <span className="badge bg-light text-secondary border">6 Months</span>
            </div>
            <div className="card-body p-3" style={{ height: '270px' }}>
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          </div>
        </div>

        {/* Doughnut Chart: Payment Status Breakdown */}
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-pie-chart-fill text-warning me-2"></i>Payment Status Distribution
              </h6>
              <span className="badge bg-light text-secondary border">All Time</span>
            </div>
            <div className="card-body p-3 d-flex align-items-center justify-content-center" style={{ height: '270px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling Electronics Products & Quick Shortcuts */}
      <div className="row g-3 mb-4">
        {/* Bar Chart: Top Products */}
        <div className="col-lg-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h6 className="fw-bold mb-0">
                <i className="bi bi-bar-chart-line-fill text-success me-2"></i>Top Revenue Generating Electronics Products
              </h6>
              <Link to="/items" className="btn btn-sm btn-light border">Catalog</Link>
            </div>
            <div className="card-body p-3" style={{ height: '220px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h6 className="fw-bold mb-0"><i className="bi bi-lightning-charge-fill text-warning me-2"></i>Quick Actions</h6>
            </div>
            <div className="card-body p-3 d-flex flex-column justify-content-between gap-2">
              <Link to="/create-bill" className="btn btn-primary p-2.5 text-start fw-bold shadow-sm d-flex align-items-center justify-content-between">
                <span><i className="bi bi-plus-square me-2"></i>Create New Invoice</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/parties" className="btn btn-dark p-2.5 text-start fw-bold shadow-sm d-flex align-items-center justify-content-between">
                <span><i className="bi bi-people me-2"></i>Customer Directory</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/items" className="btn btn-secondary p-2.5 text-start fw-bold shadow-sm d-flex align-items-center justify-content-between">
                <span><i className="bi bi-box-seam me-2"></i>Electronics Catalog</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
              <Link to="/bills" className="btn btn-info p-2.5 text-white text-start fw-bold shadow-sm d-flex align-items-center justify-content-between">
                <span><i className="bi bi-receipt me-2"></i>Invoice History & CSV</span>
                <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2"></i>Recent Generated Invoices</h6>
          <Link to="/bills" className="btn btn-sm btn-primary">View All Invoices</Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover table-sm mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Customer / Party Name</th>
                <th className="text-end">Grand Total</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentBills.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted py-4">No invoices created yet. Click "Create GST Bill" to start!</td></tr>
              ) : (
                data.recentBills.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold">
                      <Link to={`/bills/${b.id}`} className="text-decoration-none">{b.invoice_no}</Link>
                    </td>
                    <td>{new Date(b.invoice_date).toLocaleDateString('en-IN')}</td>
                    <td className="fw-semibold">{b.party_name}</td>
                    <td className="text-end fw-bold text-success">₹{Number(b.grand_total).toFixed(2)}</td>
                    <td>
                      <span className={`badge bg-${b.status === 'Paid' ? 'success' : b.status === 'Partial' ? 'warning' : 'danger'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/bills/${b.id}`} className="text-primary fs-5 p-1 d-inline-flex align-items-center" title="View Invoice">
                        <i className="bi bi-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
