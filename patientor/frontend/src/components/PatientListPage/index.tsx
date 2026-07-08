import { useState } from "react";
import {
  Box,
  Table,
  Button,
  TableHead,
  Typography,
  TableCell,
  TableRow,
  TableBody,
} from "@mui/material";
import axios from "axios";

import { PatientFormValues, Patient } from "../../types";
import AddPatientModal from "../AddPatientModal";

import HealthRatingBar from "../HealthRatingBar";

import patientService from "../../services/patients";
import { Link } from "react-router-dom";

interface Props {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const PatientListPage = ({ patients, setPatients }: Props) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const openModal = (): void => setModalOpen(true);

  const closeModal = (): void => {
    setModalOpen(false);
    setError(undefined);
  };

  const submitNewPatient = async (values: PatientFormValues) => {
    try {
      const patient = await patientService.create(values);
      setPatients(patients.concat(patient));
      setModalOpen(false);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e?.response?.data && typeof e?.response?.data === "string") {
          const message = e.response.data.replace(
            "Something went wrong. Error: ",
            "",
          );
          console.error(message);
          setError(message);
        } else {
          setError("Unrecognized axios error");
        }
      } else {
        console.error("Unknown error", e);
        setError("Unknown error");
      }
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 1000,
        marginTop: 3,
        padding: 3,
        borderRadius: 4,
        background:
          "linear-gradient(135deg, rgba(25, 118, 210, 0.10), rgba(156, 39, 176, 0.08))",
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          padding: 4,
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Patients
            </Typography>
            <Typography color="text.secondary">
              Browse patient records and open full patient details.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => openModal()}
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
            Add New Patient
          </Button>
        </Box>

        <Table
          sx={{
            "& th": {
              fontWeight: 700,
              color: "text.secondary",
            },
            "& td": {
              borderColor: "divider",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Occupation</TableCell>
              <TableCell>Health Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(patients).map((patient: Patient) => (
              <TableRow
                key={patient.id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Link
                    to={`/patients/${patient.id}`}
                    style={{
                      color: "#1976d2",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {patient.name}
                  </Link>
                </TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.occupation}</TableCell>
                <TableCell>
                  <HealthRatingBar showText={false} rating={1} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <AddPatientModal
          modalOpen={modalOpen}
          onSubmit={submitNewPatient}
          error={error}
          onClose={closeModal}
        />
      </Box>
    </Box>
  );
};

export default PatientListPage;
