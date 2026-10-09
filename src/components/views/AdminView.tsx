import { useState } from "react"
import { products } from "../../products"
import { money } from "../../utils/format"
import Button from "../common/Button"
import Icon from "../common/Icon"

export function AdminTable({
  tab,
  compact = false,
}: {
  tab: string
  compact?: boolean
}) {
  return (
    <div className="admin-table-wrap">
      <div className="table-tools">
        <input placeholder={`Search ${tab.toLowerCase()}...`} />
        <Button variant="outline">
          <Icon name="filter" /> Filter
        </Button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID / SKU</th>
            <th>{tab === "Products" ? "Shirt" : "Customer"}</th>
            <th>Status</th>
            <th>Value / Stock</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.slice(0, compact ? 4 : 10).map((p, i) => (
            <tr key={p.id}>
              <td>
                #{tab.slice(0, 3).toUpperCase()}-{1042 + i}
              </td>
              <td>
                <div className="table-product">
                  {tab === "Products" && <img src={p.images[0]} alt="" />}
                  <span>
                    <strong>
                      {tab === "Products"
                        ? p.name
                        : [
                            "Aarav Kapoor",
                            "Rohan Shah",
                            "Kabir Singh",
                            "Vihaan Joshi",
                          ][i % 4]}
                    </strong>
                    <small>{p.sku}</small>
                  </span>
                </div>
              </td>
              <td>
                <b className="status">
                  {i % 3 === 0
                    ? "Processing"
                    : i % 3 === 1
                      ? "Active"
                      : "Shipped"}
                </b>
              </td>
              <td>
                {tab === "Inventory" ? `${12 - i} units` : money(p.price)}
              </td>
              <td>Today, {10 + i}:24</td>
              <td>•••</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Dashboard() {
  const stats = [
    ["Total revenue", "₹8,42,590", "+18.2%"],
    ["Orders", "1,248", "+12.5%"],
    ["Shirts sold", "1,614", "+16.8%"],
    ["Returns", "42", "2.6% rate"],
  ]

  return (
    <>
      <div className="stats-grid">
        {stats.map(([a, b, c]) => (
          <article key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c} vs last month</small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <article className="sales-chart">
          <div>
            <h3>Sales overview</h3>
            <select>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="bars">
            {[48, 62, 51, 78, 65, 88, 72, 94, 83, 100, 87, 96].map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="chart-labels">
            <span>1 Apr</span>
            <span>10 Apr</span>
            <span>20 Apr</span>
            <span>30 Apr</span>
          </div>
        </article>
        <article className="stock-alerts">
          <h3>Inventory alerts</h3>
          {products.slice(0, 4).map((p, i) => (
            <div key={p.id}>
              <img src={p.images[0]} alt="" />
              <span>
                <strong>{p.name}</strong>
                <small>
                  {i === 0 ? "Size M out of stock" : `${i + 2} units remaining`}
                </small>
              </span>
              <b className={i === 0 ? "out" : ""}>{i === 0 ? "Out" : "Low"}</b>
            </div>
          ))}
          <Button variant="text">
            View inventory <Icon name="arrow" />
          </Button>
        </article>
      </div>
      <div className="admin-orders">
        <h3>Recent orders</h3>
        <AdminTable tab="Orders" compact />
      </div>
    </>
  )
}

export function AdminView() {
  const [tab, setTab] = useState("Overview")
  const nav = [
    "Overview",
    "Products",
    "Orders",
    "Customers",
    "Inventory",
    "Returns",
    "Coupons",
    "Shipping",
    "Notifications",
  ]

  return (
    <div className="admin">
      <aside>
        <div className="admin-logo">
          AVYR <small>ADMIN</small>
        </div>
        {nav.map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
            type="button"
          >
            {x}
          </button>
        ))}
        <button
          className="admin-exit"
          onClick={() => window.location.reload()}
          type="button"
        >
          Return to store
        </button>
      </aside>
      <main>
        <div className="admin-top">
          <div>
            <span className="eyebrow">Store Dashboard</span>
            <h1>{tab}</h1>
          </div>
          <Button>
            <Icon name="plus" /> Add shirt
          </Button>
        </div>
        {tab === "Overview" ? <Dashboard /> : <AdminTable tab={tab} />}
      </main>
    </div>
  )
}

export default AdminView
