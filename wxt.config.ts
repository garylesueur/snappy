import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Snappy",
    description: "Take beautiful, framed screenshots instantly",
    permissions: ["activeTab", "storage"],
  },
});
