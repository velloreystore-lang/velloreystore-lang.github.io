import { supabase } from '../supabase-helpers.js';

// Elements
const totalUsersEl = document.getElementById('totalUsers');
const activeUsersEl = document.getElementById('activeUsers');
const totalArticlesEl = document.getElementById('totalArticles');
const upvotesEl = document.getElementById('upvotes');
const downvotesEl = document.getElementById('downvotes');
const articlesBody = document.getElementById('articlesBody');
const timeframeButtons = document.querySelectorAll('.timeframe-select button');

let currentPeriod = 'thisMonth';

// --- Load Stats ---
async function loadStats(period = 'thisMonth') {
  const now = new Date();
  let startDate;

  if (period === 'thisMonth') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === 'lastMonth') startDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
  else startDate = new Date(0); // all time

  // Users
  const { data: users } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .gte('created_at', startDate.toISOString());

  totalUsersEl.textContent = `Total Users: ${users.length}`;

  // Active Users (last login)
  const { data: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .gte('last_login', startDate.toISOString());
  activeUsersEl.textContent = `Active Users: ${activeUsers.length}`;

  // Articles
  const { data: articles } = await supabase
    .from('pending_articles')
    .select('*', { count: 'exact' })
    .gte('created_at', startDate.toISOString());
  totalArticlesEl.textContent = `Total Articles: ${articles.length}`;

  // Upvotes & downvotes
  const upvotes = articles.reduce((sum, a) => sum + (a.upvotes || 0), 0);
  const downvotes = articles.reduce((sum, a) => sum + (a.downvotes || 0), 0);
  upvotesEl.textContent = `Upvotes: ${upvotes}`;
  downvotesEl.textContent = `Downvotes: ${downvotes}`;
}

// --- Load Articles Table ---
async function loadArticlesTable(period = 'thisMonth') {
  const now = new Date();
  let startDate;

  if (period === 'thisMonth') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === 'lastMonth') startDate = new Date(now.getFullYear(), now.getMonth()-1, 1);
  else startDate = new Date(0); // all time

  const { data: articles } = await supabase
    .from('pending_articles')
    .select('*')
    .gte('created_at', startDate.toISOString());

  articlesBody.innerHTML = '';
  articles.forEach(a => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.title}</td>
      <td>${a.author_id}</td>
      <td>${a.status}</td>
      <td>${a.upvotes || 0}</td>
      <td>${a.downvotes || 0}</td>
      <td>
        <button class="action-btn" onclick="updateArticleStatus('${a.id}','approved')">Approve</button>
        <button class="action-btn" onclick="updateArticleStatus('${a.id}','rejected')">Reject</button>
      </td>
    `;
    articlesBody.appendChild(tr);
  });
}

// --- Update Article Status ---
window.updateArticleStatus = async (id, status) => {
  const { error } = await supabase
    .from('pending_articles')
    .update({ status })
    .eq('id', id);
  if (error) return alert('Error: ' + error.message);
  loadStats(currentPeriod);
  loadArticlesTable(currentPeriod);
};

// --- Handle Timeframe Buttons ---
timeframeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentPeriod = btn.dataset.period;
    loadStats(currentPeriod);
    loadArticlesTable(currentPeriod);
  });
});

// --- Initial Load ---
loadStats(currentPeriod);
loadArticlesTable(currentPeriod);
let signupChart, upvoteChart;

// Function to generate month labels
function getPastMonths(n = 6) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
  }
  return months;
}

// Load chart data
async function loadCharts() {
  const months = getPastMonths(6);

  // Signups per month
  const signupCounts = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    const end = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0);
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    signupCounts.push(count);
  }

  // Upvotes per month
  const upvoteCounts = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
    const end = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0);
    const { data } = await supabase
      .from('pending_articles')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());
    const sum = data.reduce((acc, a) => acc + (a.upvotes || 0), 0);
    upvoteCounts.push(sum);
  }

  // Signup chart
  const ctx1 = document.getElementById('signupChart').getContext('2d');
  if (signupChart) signupChart.destroy();
  signupChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'User Signups',
        data: signupCounts,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76,175,80,0.2)',
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' }, grid: { color: '#333' } },
        y: { ticks: { color: '#fff' }, grid: { color: '#333' } }
      }
    }
  });

  // Upvote chart
  const ctx2 = document.getElementById('upvoteChart').getContext('2d');
  if (upvoteChart) upvoteChart.destroy();
  upvoteChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Article Upvotes',
        data: upvoteCounts,
        backgroundColor: '#fbbc05'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' }, grid: { color: '#333' } },
        y: { ticks: { color: '#fff' }, grid: { color: '#333' } }
      }
    }
  });
}

// Call charts after loading stats
loadCharts();
