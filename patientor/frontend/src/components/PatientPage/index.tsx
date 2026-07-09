import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WorkIcon from "@mui/icons-material/Work";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import type { Diagnosis, Entry, Patient } from "../../types";
import { Gender, HealthCheckRating } from "../../types";
import patientService from "../../services/patients";

const genderSymbol = (gender: Gender): string => {
  switch (gender) {
    case Gender.Male:
      return "♂";
    case Gender.Female:
      return "♀";
    case Gender.Other:
      return "⚧";
    default:
      return "";
  }
};

const assertNever = (value: never): never => {
  throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
};

const getDiagnosisName = (
  code: string,
  diagnoses: Diagnosis[],
): string | undefined => {
  return diagnoses.find((diagnosis) => diagnosis.code === code)?.name;
};

const healthCheckRatingEmoji = (rating: HealthCheckRating): string => {
  switch (rating) {
    case HealthCheckRating.Healthy:
      return "😎";
    case HealthCheckRating.LowRisk:
      return "🙂";
    case HealthCheckRating.HighRisk:
      return "😬";
    case HealthCheckRating.CriticalRisk:
      return "💀";
    default:
      return assertNever(rating);
  }
};

const EntryHeader = ({ entry }: { entry: Entry }) => {
  switch (entry.type) {
    case "Hospital":
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 800 }}>{entry.date}</Typography>
          <LocalHospitalIcon fontSize="small" />
          <Typography color="text.secondary">Hospital</Typography>
        </Stack>
      );

    case "OccupationalHealthcare":
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 800 }}>{entry.date}</Typography>
          <WorkIcon fontSize="small" />
          <Typography color="text.secondary">
            Occupational healthcare · {entry.employerName}
          </Typography>
        </Stack>
      );

    case "HealthCheck":
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 800 }}>{entry.date}</Typography>
          <MedicalServicesIcon fontSize="small" />
          <Typography color="text.secondary">Health check</Typography>
        </Stack>
      );

    default:
      return assertNever(entry);
  }
};

const EntryTypeDetails = ({ entry }: { entry: Entry }) => {
  switch (entry.type) {
    case "Hospital":
      return (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Discharge
          </Typography>
          <Typography>
            {entry.discharge.date}: {entry.discharge.criteria}
          </Typography>
        </Box>
      );

    case "OccupationalHealthcare":
      return entry.sickLeave ? (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Sick leave
          </Typography>
          <Typography>
            {entry.sickLeave.startDate} – {entry.sickLeave.endDate}
          </Typography>
        </Box>
      ) : null;

    case "HealthCheck":
      return (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Health check rating:
          </Typography>
          <Typography>
            {healthCheckRatingEmoji(entry.healthCheckRating)}
          </Typography>
        </Box>
      );

    default:
      return assertNever(entry);
  }
};

const EntryDetails = ({
  entry,
  diagnoses,
}: {
  entry: Entry;
  diagnoses: Diagnosis[];
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255, 255, 255, 0.72)",
      }}
    >
      <CardContent>
        <EntryHeader entry={entry} />

        <Typography sx={{ marginTop: 0.5, fontStyle: "italic" }}>
          {entry.description}
        </Typography>

        {entry.diagnosisCodes && entry.diagnosisCodes.length > 0 && (
          <Box component="ul" sx={{ marginBottom: 0 }}>
            {entry.diagnosisCodes.map((code) => (
              <li key={code}>
                <Typography component="span">
                  {code} {getDiagnosisName(code, diagnoses)}
                </Typography>
              </li>
            ))}
          </Box>
        )}

        <EntryTypeDetails entry={entry} />

        <Typography sx={{ marginTop: 2 }} color="text.secondary">
          diagnose by {entry.specialist}
        </Typography>
      </CardContent>
    </Card>
  );
};

interface Props {
  diagnoses: Diagnosis[];
}

const PatientPage = ({ diagnoses }: Props) => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) {
        return;
      }

      const patient = await patientService.getById(id);
      setPatient(patient);
    };

    void fetchPatient();
  }, [id]);

  if (!patient) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 760,
        marginTop: 3,
        padding: 3,
        borderRadius: 4,
        background:
          "linear-gradient(135deg, rgba(25, 118, 210, 0.10), rgba(156, 39, 176, 0.08))",
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(8px)",
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ marginBottom: 2 }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {patient.name}
              </Typography>

              <Typography color="text.secondary" sx={{ marginTop: 0.5 }}>
                {patient.occupation}
              </Typography>
            </Box>

            <Chip
              label={genderSymbol(patient.gender)}
              sx={{
                fontSize: "1.4rem",
                height: 48,
                width: 48,
                borderRadius: "50%",
                "& .MuiChip-label": {
                  paddingX: 0,
                  overflow: "visible",
                },
              }}
            />
          </Stack>

          <Divider sx={{ marginY: 3 }} />

          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Social security number
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{patient.ssn}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Date of birth
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {patient.dateOfBirth}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Occupation
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {patient.occupation}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, marginBottom: 2 }}>
          entries
        </Typography>

        <Stack spacing={2}>
          {patient.entries && patient.entries.length > 0 ? (
            patient.entries.map((entry) => (
              <EntryDetails
                key={entry.id}
                entry={entry}
                diagnoses={diagnoses}
              />
            ))
          ) : (
            <Typography color="text.secondary">No entries yet.</Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default PatientPage;
