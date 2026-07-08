import { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  useLocation,
} from "react-router-dom";
import { Button, Divider, Container, Typography } from "@mui/material";
import PatientPage from "./components/PatientPage";

import { apiBaseUrl } from "./constants";
import { Patient } from "./types";

import patientService from "./services/patients";
import PatientListPage from "./components/PatientListPage";

interface AppContentProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const AppContent = ({ patients, setPatients }: AppContentProps) => {
  const location = useLocation();

  return (
    <Container>
      <Typography variant="h3" sx={{ marginBottom: "0.5em" }}>
        Patientor
      </Typography>

      {location.pathname !== "/" && (
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{
            borderRadius: 3,
            paddingX: 3,
            paddingY: 1.2,
            fontWeight: 800,
            textTransform: "none",
            background:
              "linear-gradient(135deg, rgba(25, 118, 210, 0.95), rgba(156, 39, 176, 0.85))",
            boxShadow: "0 10px 24px rgba(25, 118, 210, 0.22)",
            "&:hover": {
              background:
                "linear-gradient(135deg, rgba(21, 101, 192, 1), rgba(123, 31, 162, 0.95))",
              boxShadow: "0 12px 28px rgba(25, 118, 210, 0.28)",
            },
          }}
        >
          Home
        </Button>
      )}

      <Divider sx={{ marginY: 2 }} />

      <Routes>
        <Route
          path="/"
          element={
            <PatientListPage patients={patients} setPatients={setPatients} />
          }
        />
        <Route path="/patients/:id" element={<PatientPage />} />
      </Routes>
    </Container>
  );
};

const App = () => {
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    void axios.get<void>(`${apiBaseUrl}/ping`);

    const fetchPatientList = async () => {
      const patients = await patientService.getAll();
      setPatients(patients);
    };

    void fetchPatientList();
  }, []);

  return (
    <div className="App">
      <Router>
        <AppContent patients={patients} setPatients={setPatients} />
      </Router>
    </div>
  );
};

export default App;
