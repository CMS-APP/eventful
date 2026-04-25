import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faPeopleGroup,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import { doc, onSnapshot } from "firebase/firestore";
import { FIRESTORE_DB } from "@/app/Firebase";
import "./StatsView.css";

export default function StatsView() {
  const [eventCount, setEventCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  function getStats() {
    const docRef = doc(FIRESTORE_DB, "stats", "stats");

    // Setting up the listener
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const eventCount = docSnap.data().eventCount;
        const userCount = docSnap.data().userCount;
        console.log("Event Count: ", eventCount);
        console.log("User Count: ", userCount);

        setEventCount(eventCount);
        setUserCount(userCount);
      }
    });
  }

  useEffect(() => {
    const unsubscribe = getStats(); // Set up the listener

    // Cleanup the listener when the component unmounts
    return () => {
      unsubscribe(); // Unsubscribe from the listener
    };
  }, []);

  return (
    <div>
      <h1 className="mt-2 mb-3">Statistics</h1>

      <div className="flex md:gap-8 gap-5 md:flex-row grid grid-cols-3 md:flex">
        <div>
          <div className="analytics-icon-row">
            <FontAwesomeIcon icon={faStar} size={"xl"} />
            <h3>4.9</h3>
          </div>

          <h3>Rating</h3>
        </div>

        <div>
          <div className="analytics-icon-row">
            <FontAwesomeIcon
              icon={faPeopleGroup}
              size="xl"
            />
            <h3>{userCount}</h3>
          </div>
          <h3>Users</h3>
        </div>

        <div>
          <div className="analytics-icon-row">
            <FontAwesomeIcon
              icon={faCalendar}
              size="xl"
            />
            <h3>{eventCount}</h3>
          </div>

          <h3>Events</h3>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start" }}></div>
    </div>
  );
}
