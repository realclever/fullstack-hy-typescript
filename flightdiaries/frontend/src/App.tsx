import axios from "axios";
import { useEffect, useState } from "react";
import diaryService from "./services";
import type { DiaryEntry, NewDiaryEntry, Visibility, Weather } from "./types";

const App = () => {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [weather, setWeather] = useState("");
  const [visibility, setVisibility] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    diaryService.getAll().then((data) => {
      setDiaries(data);
    });
  }, []);

  const addDiary = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const newDiary: NewDiaryEntry = {
      date,
      weather: weather as Weather,
      visibility: visibility as Visibility,
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
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div>
          weather{" "}
          <input
            value={weather}
            onChange={(event) => setWeather(event.target.value)}
          />
        </div>

        <div>
          visibility{" "}
          <input
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          />
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
        </div>
      ))}
    </div>
  );
};

export default App;
