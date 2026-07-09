import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WorkIcon from "@mui/icons-material/Work";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import type { Diagnosis, Entry, NewEntry, Patient } from "../../types";
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

interface AddHealthCheckEntryFormProps {
  error?: string;
  onCancel: () => void;
  onSubmit: (entry: NewEntry) => Promise<void>;
}

const AddHealthCheckEntryForm = ({
  error,
  onCancel,
  onSubmit,
}: AddHealthCheckEntryFormProps) => {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [healthCheckRating, setHealthCheckRating] = useState("");
  const [diagnosisCodes, setDiagnosisCodes] = useState("");

  const resetForm = () => {
    setDate("");
    setDescription("");
    setSpecialist("");
    setHealthCheckRating("");
    setDiagnosisCodes("");
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const codes = diagnosisCodes
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    const newEntry: NewEntry = {
      type: "HealthCheck",
      date,
      description,
      specialist,
      healthCheckRating: Number(healthCheckRating) as HealthCheckRating,
      ...(codes.length > 0 ? { diagnosisCodes: codes } : {}),
    };

    try {
      await onSubmit(newEntry);
      resetForm();
    } catch {
      // Parent component shows the error message.
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        marginTop: 3,
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "divider",
        backgroundColor: "rgba(255, 255, 255, 0.72)",
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800, marginBottom: 2 }}>
          New HealthCheck Entry
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Date"
            fullWidth
            size="small"
            margin="dense"
            value={date}
            onChange={({ target }) => setDate(target.value)}
          />

          <TextField
            label="Description"
            fullWidth
            size="small"
            margin="dense"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
          />

          <TextField
            label="Specialist"
            fullWidth
            size="small"
            margin="dense"
            value={specialist}
            onChange={({ target }) => setSpecialist(target.value)}
          />

          <TextField
            label="Health Check Rating (0-3)"
            fullWidth
            size="small"
            margin="dense"
            value={healthCheckRating}
            onChange={({ target }) => setHealthCheckRating(target.value)}
          />

          <TextField
            label="Diagnosis Codes (comma-separated)"
            fullWidth
            size="small"
            margin="dense"
            value={diagnosisCodes}
            onChange={({ target }) => setDiagnosisCodes(target.value)}
          />

          <Stack direction="row" spacing={1} sx={{ marginTop: 2 }}>
            <Button type="submit" variant="contained">
              Add
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object" && "error" in data) {
      return "Invalid entry. Please check that all required fields are filled correctly.";
    }

    if (typeof data === "string") {
      return data;
    }

    return "Unrecognized axios error";
  }

  return "Unknown error";
};

interface Props {
  diagnoses: Diagnosis[];
}

const PatientPage = ({ diagnoses }: Props) => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [entryError, setEntryError] = useState<string>();

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

  const submitNewEntry = async (entry: NewEntry) => {
    if (!patient) {
      return;
    }

    try {
      const addedEntry = await patientService.addEntry(patient.id, entry);

      setPatient({
        ...patient,
        entries: patient.entries
          ? patient.entries.concat(addedEntry)
          : [addedEntry],
      });
      setEntryError(undefined);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setEntryError(message);
      throw error;
    }
  };

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

        <AddHealthCheckEntryForm
          error={entryError}
          onCancel={() => setEntryError(undefined)}
          onSubmit={submitNewEntry}
        />
      </Box>
    </Box>
  );
};

export default PatientPage;
