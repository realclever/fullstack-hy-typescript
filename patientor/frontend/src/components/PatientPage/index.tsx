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
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WorkIcon from "@mui/icons-material/Work";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";

import type { Diagnosis, Entry, NewEntry, Patient } from "../../types";
import { Gender, HealthCheckRating } from "../../types";
import patientService from "../../services/patients";

type EntryType = "HealthCheck" | "OccupationalHealthcare" | "Hospital";

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
      return "🤒";
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

interface AddEntryFormProps {
  diagnoses: Diagnosis[];
  error?: string;
  onCancel: () => void;
  onSubmit: (entry: NewEntry) => Promise<void>;
}

const AddEntryForm = ({
  diagnoses,
  error,
  onCancel,
  onSubmit,
}: AddEntryFormProps) => {
  const [entryType, setEntryType] = useState<EntryType>("HealthCheck");

  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [diagnosisCodes, setDiagnosisCodes] = useState<string[]>([]);

  const [healthCheckRating, setHealthCheckRating] = useState("0");
  const [employerName, setEmployerName] = useState("");
  const [sickLeaveStartDate, setSickLeaveStartDate] = useState("");
  const [sickLeaveEndDate, setSickLeaveEndDate] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [dischargeCriteria, setDischargeCriteria] = useState("");

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "rgba(255, 255, 255, 0.82)",
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
    },
    "& .MuiInputBase-input": {
      fontSize: "0.95rem",
    },
  };

  const buttonSx = {
    borderRadius: 3,
    paddingX: 3,
    fontWeight: 800,
    textTransform: "none",
  };

  const diagnosisMenuProps = {
    PaperProps: {
      sx: {
        maxHeight: 320,
        borderRadius: 3,
        marginTop: 1,
      },
    },
  };

  const resetForm = (type: EntryType = entryType) => {
    setDate("");
    setDescription("");
    setSpecialist("");
    setDiagnosisCodes([]);
    setHealthCheckRating(type === "HealthCheck" ? "0" : "");
    setEmployerName("");
    setSickLeaveStartDate("");
    setSickLeaveEndDate("");
    setDischargeDate("");
    setDischargeCriteria("");
  };

  const handleEntryTypeChange = (type: EntryType) => {
    setEntryType(type);
    resetForm(type);
  };

  const handleCancel = () => {
    resetForm("HealthCheck");
    setEntryType("HealthCheck");
    onCancel();
  };

  const handleDiagnosisCodeChange = (
    event: SelectChangeEvent<typeof diagnosisCodes>,
  ) => {
    const value = event.target.value;
    setDiagnosisCodes(typeof value === "string" ? value.split(",") : value);
  };

  const createNewEntry = (): NewEntry => {
    const baseEntry = {
      date,
      description,
      specialist,
      ...(diagnosisCodes.length > 0 ? { diagnosisCodes } : {}),
    };

    switch (entryType) {
      case "HealthCheck":
        return {
          ...baseEntry,
          type: "HealthCheck",
          healthCheckRating: Number(healthCheckRating) as HealthCheckRating,
        };

      case "OccupationalHealthcare":
        return {
          ...baseEntry,
          type: "OccupationalHealthcare",
          employerName,
          ...(sickLeaveStartDate && sickLeaveEndDate
            ? {
                sickLeave: {
                  startDate: sickLeaveStartDate,
                  endDate: sickLeaveEndDate,
                },
              }
            : {}),
        };

      case "Hospital":
        return {
          ...baseEntry,
          type: "Hospital",
          discharge: {
            date: dischargeDate,
            criteria: dischargeCriteria,
          },
        };

      default:
        return assertNever(entryType);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await onSubmit(createNewEntry());
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
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        boxShadow: "0 18px 45px rgba(25, 118, 210, 0.08)",
      }}
    >
      <CardContent sx={{ padding: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, marginBottom: 0.5 }}>
          New Entry
        </Typography>

        <Typography color="text.secondary" sx={{ marginBottom: 2 }}>
          Add a new medical record entry for this patient.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} key={entryType}>
          <TextField
            select
            label="Entry type"
            fullWidth
            size="small"
            margin="dense"
            value={entryType}
            onChange={({ target }) =>
              handleEntryTypeChange(target.value as EntryType)
            }
            sx={inputSx}
          >
            <MenuItem value="HealthCheck">Health Check</MenuItem>
            <MenuItem value="OccupationalHealthcare">
              Occupational Healthcare
            </MenuItem>
            <MenuItem value="Hospital">Hospital</MenuItem>
          </TextField>

          <TextField
            label="Date *"
            type="date"
            fullWidth
            size="small"
            margin="dense"
            value={date}
            onChange={({ target }) => setDate(target.value)}
            InputLabelProps={{ shrink: true }}
            sx={inputSx}
          />

          <TextField
            label="Description *"
            fullWidth
            size="small"
            margin="dense"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
            sx={inputSx}
          />

          <TextField
            label="Specialist *"
            fullWidth
            size="small"
            margin="dense"
            value={specialist}
            onChange={({ target }) => setSpecialist(target.value)}
            sx={inputSx}
          />

          <FormControl fullWidth size="small" margin="dense" sx={inputSx}>
            <InputLabel id="diagnosis-codes-label">Diagnosis codes</InputLabel>
            <Select
              labelId="diagnosis-codes-label"
              multiple
              value={diagnosisCodes}
              onChange={handleDiagnosisCodeChange}
              input={<OutlinedInput label="Diagnosis codes" />}
              MenuProps={diagnosisMenuProps}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((code) => (
                    <Chip
                      key={code}
                      label={code}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {diagnoses.map((diagnosis) => (
                <MenuItem key={diagnosis.code} value={diagnosis.code}>
                  {diagnosis.code} — {diagnosis.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {entryType === "HealthCheck" && (
            <TextField
              select
              label="Health Check Rating *"
              fullWidth
              size="small"
              margin="dense"
              value={healthCheckRating}
              onChange={({ target }) => setHealthCheckRating(target.value)}
              sx={inputSx}
            >
              <MenuItem value="0">0 — Healthy 😎</MenuItem>
              <MenuItem value="1">1 — Low Risk 🙂</MenuItem>
              <MenuItem value="2">2 — High Risk 🤒</MenuItem>
              <MenuItem value="3">3 — Critical Risk 💀</MenuItem>
            </TextField>
          )}

          {entryType === "OccupationalHealthcare" && (
            <>
              <TextField
                label="Employer Name *"
                fullWidth
                size="small"
                margin="dense"
                value={employerName}
                onChange={({ target }) => setEmployerName(target.value)}
                sx={inputSx}
              />

              <TextField
                label="Sick Leave Start Date"
                type="date"
                fullWidth
                size="small"
                margin="dense"
                value={sickLeaveStartDate}
                onChange={({ target }) => setSickLeaveStartDate(target.value)}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />

              <TextField
                label="Sick Leave End Date"
                type="date"
                fullWidth
                size="small"
                margin="dense"
                value={sickLeaveEndDate}
                onChange={({ target }) => setSickLeaveEndDate(target.value)}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />
            </>
          )}

          {entryType === "Hospital" && (
            <>
              <TextField
                label="Discharge Date *"
                type="date"
                fullWidth
                size="small"
                margin="dense"
                value={dischargeDate}
                onChange={({ target }) => setDischargeDate(target.value)}
                InputLabelProps={{ shrink: true }}
                sx={inputSx}
              />

              <TextField
                label="Discharge Criteria *"
                fullWidth
                size="small"
                margin="dense"
                value={dischargeCriteria}
                onChange={({ target }) => setDischargeCriteria(target.value)}
                sx={inputSx}
              />
            </>
          )}

          <Stack direction="row" spacing={1.5} sx={{ marginTop: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                ...buttonSx,
                background:
                  "linear-gradient(135deg, rgba(25, 118, 210, 0.95), rgba(156, 39, 176, 0.85))",
                boxShadow: "0 10px 24px rgba(25, 118, 210, 0.18)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, rgba(21, 101, 192, 1), rgba(123, 31, 162, 0.95))",
                },
              }}
            >
              Add
            </Button>

            <Button variant="outlined" onClick={handleCancel} sx={buttonSx}>
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
  const [entryFormVisible, setEntryFormVisible] = useState(false);

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
      setEntryFormVisible(false);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setEntryError(message);
      throw error;
    }
  };

  const addEntryButtonSx = {
    marginTop: 3,
    borderRadius: 3,
    paddingX: 3,
    paddingY: 1,
    fontWeight: 800,
    textTransform: "none",
    background:
      "linear-gradient(135deg, rgba(25, 118, 210, 0.95), rgba(156, 39, 176, 0.85))",
    boxShadow: "0 10px 24px rgba(25, 118, 210, 0.18)",
    "&:hover": {
      background:
        "linear-gradient(135deg, rgba(21, 101, 192, 1), rgba(123, 31, 162, 0.95))",
    },
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

        {entryFormVisible ? (
          <AddEntryForm
            diagnoses={diagnoses}
            error={entryError}
            onCancel={() => {
              setEntryError(undefined);
              setEntryFormVisible(false);
            }}
            onSubmit={submitNewEntry}
          />
        ) : (
          <Button
            variant="contained"
            sx={addEntryButtonSx}
            onClick={() => setEntryFormVisible(true)}
          >
            Add New Entry
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default PatientPage;
