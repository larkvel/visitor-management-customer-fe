import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./api";
import CompanyDashboard from "./components/CompanyDashboard";
import { Registration } from "./components/Registration";
import { toDateTimeLocal, toIso, can } from "./utils/helpers";
import "./styles.css";
