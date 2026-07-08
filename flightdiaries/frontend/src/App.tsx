import axios from "axios";
import { useEffect, useState } from "react";
import diaryService from "./services";
import { Visibility, Weather } from "./types";
import type { DiaryEntry, NewDiaryEntry } from "./types";

const weatherOptions = Object.values(Weather);
const visibilityOptions = Object.values(Visibility);

const App = () => {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [weather, setWeather] = useState<Weather | "">("");
  const [visibility, setVisibility] = useState<Visibility | "">("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    diaryService.getAll().then((data) => {
      setDiaries(data);
    });
  }, []);

  const addDiary = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (!date || !weather || !visibility) {
      setError("Date, weather and visibility are required");
      return;
    }

    const newDiary: NewDiaryEntry = {
      date,
      weather,
      visibility,
      comment,
    };

    diaryService
      .create(newDiary)
      .then((returnedDiary) => {
        setDiaries(diaries.concat(returnedDiary));

        setDate("");
        setWeather("");
        setVisibility("");
        setComment("");
        setError(null);
      })
      .catch((error: unknown) => {
        if (axios.isAxiosError(error)) {
          const responseData: unknown = error.response?.data;

          if (
            typeof responseData === "object" &&
            responseData !== null &&
            "error" in responseData &&
            typeof responseData.error === "string"
          ) {
            setError(responseData.error);
            return;
          }
        }

        setError("Failed to create diary entry");
      });
  };

  return (
    <div>
      <h1>Flight Diaries</h1>

      <h2>Add new entry</h2>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}

      <form onSubmit={addDiary}>
        <div>
          date{" "}
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>

        <div>
          weather{" "}
          {weatherOptions.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="weather"
                value={option}
                checked={weather === option}
                onChange={() => setWeather(option)}
                required
              />
              {option}
            </label>
          ))}
        </div>

        <div>
          visibility{" "}
          {visibilityOptions.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name="visibility"
                value={option}
                checked={visibility === option}
                onChange={() => setVisibility(option)}
                required
              />
              {option}
            </label>
          ))}
        </div>

        <div>
          comment{" "}
          <input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>

        <button type="submit">add</button>
      </form>

      <h2>Diary entries</h2>

      {diaries.map((diary) => (
        <div key={diary.id}>
          <h3>{diary.date}</h3>
          <div>visibility: {diary.visibility}</div>
          <div>weather: {diary.weather}</div>
          {diary.comment && <div>comment: {diary.comment}</div>}
        </div>
      ))}
    </div>
  );
};

export default App;
