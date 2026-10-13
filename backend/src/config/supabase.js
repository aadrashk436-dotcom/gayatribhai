import { createClient } from "@supabase/supabase-js";
import { LocalQueryBuilder, localStore } from "./resilientDb.js";

const supabaseUrl = process.env.SUPABASE_URL || "https://qnhtnbzeyqbrzjguhgsy.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let rawSupabase = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    rawSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch (e) {
    console.warn("Could not initialize Supabase client:", e.message);
  }
}

// Resilient wrapper
export const supabase = {
  from(tableName) {
    if (tableName === "settings") {
      return {
        select: async () => {
          const settings = localStore.read().settings || {};
          const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
          return { data: rows, error: null };
        },
        upsert: async ({ key, value }) => {
          const all = localStore.read();
          all.settings = all.settings || {};
          all.settings[key] = value;
          localStore.write(all);
          return { data: { key, value }, error: null };
        },
      };
    }

    if (!rawSupabase) {
      return new LocalQueryBuilder(tableName);
    }

    // Try Supabase with fallback to LocalQueryBuilder on network fail
    const originalQuery = rawSupabase.from(tableName);
    return new Proxy(originalQuery, {
      get(target, prop) {
        if (typeof target[prop] === "function") {
          return (...args) => {
            try {
              const res = target[prop](...args);
              if (res && typeof res.then === "function") {
                return res.catch((err) => {
                  console.warn(`[DB Network Warning] Fallback to local store for '${tableName}':`, err.message);
                  return new LocalQueryBuilder(tableName);
                });
              }
              return res;
            } catch (err) {
              console.warn(`[DB Error] Falling back to local store for '${tableName}':`, err.message);
              return new LocalQueryBuilder(tableName);
            }
          };
        }
        return target[prop];
      },
    });
  },

  rpc(funcName, params) {
    if (rawSupabase) {
      return rawSupabase.rpc(funcName, params).catch(() => ({ data: null, error: null }));
    }
    return Promise.resolve({ data: null, error: null });
  },
};

export default supabase;
