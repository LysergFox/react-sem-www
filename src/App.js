import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Modal from "react-modal";
import moment from "moment";
import "./App.css";
import { InstagramEmbed } from "react-social-media-embed";

Modal.setAppElement("#root");
moment.locale("cs");

function App() {
  const [date, setDate] = useState(new Date());
  const [modalAddIsOpen, setmodalAddIsOpen] = useState(false);
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState([new Date(), new Date()]);

  const modalStyles = {
    content: {
      width: "150px",
      height: "200px",
      margin: "0 auto",
      padding: "20px",
      marginTop: "100px",
    },
  };

  const infoModalStyles = {
    content: {
      width: "400px",
      height: "400px",
      margin: "0 auto",
      padding: "20px",
      marginTop: "100px",
    },
  };

  const openModal = () => {
    setmodalAddIsOpen(true);
  };

  const closeModal = () => {
    setmodalAddIsOpen(false);
  };

  const openInfoModal = () => {
    setInfoModalIsOpen(true);
  };

  const closeInfoModal = () => {
    setInfoModalIsOpen(false);
  };

  const handleDateChange = (newDate) => {
    const startOfWeek = moment(newDate).startOf("isoWeek");
    const endOfWeek = moment(newDate).endOf("isoWeek");

    setSelectedWeek([startOfWeek, endOfWeek]);
    setSelectedDate(newDate);
    setDate(newDate);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const title = event.target.title.value;
    const time = event.target.time.value;

    const isDuplicate = appointments.some(
      (appointment) =>
        appointment.date === moment(date).format("YYYY-MM-DD") &&
        appointment.time === time
    );

    if (isDuplicate) {
      alert("There is already an appointment scheduled at the selected time.");
    } else {
      const appointment = {
        date: moment(date).format("YYYY-MM-DD"),
        title,
        time,
      };

      setAppointments([...appointments, appointment]);
      closeModal();
    }
  };

  const groupedAppointments = {};
  appointments.forEach((appointment) => {
    const appointmentDate = moment(appointment.date).format("YYYY-MM-DD");
    if (
      moment(appointmentDate).isSameOrAfter(selectedWeek[0], "day") &&
      moment(appointmentDate).isSameOrBefore(selectedWeek[1], "day")
    ) {
      if (!groupedAppointments[appointmentDate]) {
        groupedAppointments[appointmentDate] = [];
      }
      groupedAppointments[appointmentDate].push(appointment);
    }
  });

  const groupedAppointmentsArray = Object.entries(groupedAppointments).sort(
    (a, b) => moment(a[0]).diff(moment(b[0]))
  );

  const importAppointments = () => {
    fetch("./appointments.json")
      .then((response) => {
        console.log(response);
        debugger;
        return response.json();
      })
      .then((data) => setAppointments(data))
      .catch((error) => console.error("Error importing appointments:", error));
  };

  const exportAppointments = () => {
    const jsonData = JSON.stringify(appointments);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "appointments.json";
    link.click();
  };

  useEffect(() => {
    importAppointments();
  }, []);

  return (
    <div className="App">
      <div className="calendar-container">
        <h1>Kadeřnictví U Amazonky</h1>

        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          locale="cs-CZ"
          tileClassName={({ date, view }) => {
            const momentDate = moment(date);
            const isCurrentMonth = momentDate.isSame(selectedDate, "month");
            const isWithinSelectedWeek =
              momentDate.isSameOrAfter(
                moment(selectedWeek[0]).startOf("day")
              ) &&
              momentDate.isSameOrBefore(moment(selectedWeek[1]).endOf("day"));
            const hasAppointments = appointments.some((appointment) =>
              moment(appointment.date).isSame(date, "day")
            );

            if (view === "month") {
              if (!isCurrentMonth) {
                return "different-month";
              } else if (isWithinSelectedWeek && hasAppointments) {
                return "selected-week has-appointments";
              } else if (isWithinSelectedWeek) {
                return "selected-week";
              } else if (hasAppointments) {
                return "has-appointments";
              }
            }

            return "";
          }}
          calendarType="ISO 8601"
        />

        <button onClick={openModal} className="add-btn">
          Objednat
        </button>

        <button onClick={openInfoModal} className="info-btn">
          Info
        </button>

        <button onClick={importAppointments} className="info-btn">
          Uložit
        </button>

        <button onClick={exportAppointments} className="info-btn">
          Nahrát
        </button>

        <InstagramEmbed
          className="insta"
          width={328}
          url="https://www.instagram.com/p/Clnu7G5L3Gi/?igshid=MzRlODBiNWFlZA=="
        />
      </div>
      <Modal
        isOpen={modalAddIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Appointment Modal"
        style={modalStyles}
      >
        <h2 className="modal-title">Objednat</h2>

        <form onSubmit={handleFormSubmit} className="modal-form">
          <div>
            <select name="title" required>
              <option value="Sříhání">Sříhání</option>
              <option value="Foukání">Foukání</option>
              <option value="Sříhání + Foukání">Sříhání + Foukání</option>
              <option value="Barvení"> Barvení</option>
            </select>
          </div>

          <div>
            <label>Čas:</label>
            <select name="time" required className="option-modal">
              <option value="9:00">9:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
              <option value="16:00">16:00</option>
              <option value="17:00">17:00</option>
              <option value="18:00">18:00</option>
            </select>
          </div>

          <button type="submit" className="finish-modal-btn">
            Potvrdit
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={infoModalIsOpen}
        onRequestClose={closeInfoModal}
        contentLabel="Info Modal"
        style={infoModalStyles}
      >
        <h2 className="modal-title">Informace o místě</h2>
        <p>
          PORADENSTVÍ OHLEDNĚ VLASŮ, BARVY A ÚČESU <br></br>
          Zázvorkova 1997/26 Praha 5<br></br>
          Lužiny (3 minuty od metra B Lužiny) <br></br>
          Kontakt: Monika 603 733 073<br></br>
        </p>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2562.1264490635617!2d14.3338928!3d50.0464625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470b95fb3df533bb%3A0xc6ee0c00a11dbd35!2sZ%C3%A1zvorkova%201997%2F26%2C%20155%2000%20Praha%2013!5e0!3m2!1sen!2scz!4v1685297558852!5m2!1sen!2scz"
            title="map"
            width="400"
            height="200"
            style={{ border: 0 }}
            allowfullscreen=""
            loading="lazy"
          ></iframe>
        </div>
        <button onClick={closeInfoModal} className="finish-modal-btn">
          Close
        </button>
      </Modal>

      <div className="appointment-list">
        <h1>Objednávky</h1>
        {groupedAppointmentsArray.length > 0 ? (
          groupedAppointmentsArray.map(([date, appointments]) => (
            <div key={date} className="appointment-day">
              <h3>{moment(date).format("D. M. YYYY")}</h3>
              {appointments.map((appointment, index) => (
                <div key={index} className="appointment">
                  <p>{appointment.title}</p>
                  <p>{appointment.time}</p>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Žádne objednavky zvolený týden</p>
        )}
      </div>
    </div>
  );
}

export default App;
