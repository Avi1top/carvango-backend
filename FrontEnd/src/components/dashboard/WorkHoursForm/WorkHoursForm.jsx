import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./WorkHoursForm.module.css";

const WorkHoursForm = () => {
  const [workHours, setWorkHours] = useState({});
  const [open, setOpen] = useState(false);

  // fetchWorkHours: Asynchronously fetches work hours data from the server and updates the state.
  useEffect(() => {
    const fetchWorkHours = async () => {
      try {
        const response = await axios.get("/api/getWorkHours");
        setWorkHours(response.data);
      } catch (error) {
        console.error("An error occurred while fetching work hours:", error);
      }
    };

    fetchWorkHours();
  }, []);

  // adjustEndHour: Adjusts the end hour based on the start hour, ensuring it is at least 30 minutes later.
  const adjustEndHour = (startHour, endHour) => {
    const [startH, startM] = startHour.split(":").map(Number);
    const [endH, endM] = endHour.split(":").map(Number);

    let adjustedEndTime = new Date();
    adjustedEndTime.setHours(startH, startM + 30);

    if (endH < startH || (endH === startH && endM < startM + 30)) {
      return adjustedEndTime.toTimeString().split(" ")[0].slice(0, 5);
    }

    return endHour;
  };

  // validateEndHour: Validates that the end hour is at least 30 minutes after the start hour, alerting the user if not.
  const validateEndHour = (startHour, endHour) => {
    const [startH, startM] = startHour.split(":").map(Number);
    const [endH, endM] = endHour.split(":").map(Number);

    let startTime = new Date();
    startTime.setHours(startH, startM);

    let endTime = new Date();
    endTime.setHours(endH, endM);

    if (endTime.getTime() - startTime.getTime() < 30 * 60000) {
      alert("End hour must be at least 30 minutes after the start hour.");
      return adjustEndHour(startHour, endHour);
    }

    return endHour;
  };

  // handleStartHourChange: Updates the start hour and adjusts the end hour when the start hour changes.
  const handleStartHourChange = (day, e) => {
    const newStartHour = e.target.value;
    setWorkHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        startHour: newStartHour,
        endHour: adjustEndHour(newStartHour, prev[day].endHour),
      },
    }));
  };

  // handleEndHourChange: Validates and updates the end hour when the end hour input changes.
  const handleEndHourChange = (day, e) => {
    const newEndHour = e.target.value;
    setWorkHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        endHour: validateEndHour(prev[day].startHour, newEndHour),
      },
    }));
  };

  // toggleOpenStatus: Toggles the open/closed status for a specific day and resets the hours if closed.
  const toggleOpenStatus = (day) => {
    setWorkHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
        startHour: !prev[day].isOpen ? prev[day].startHour : "00:00",
        endHour: !prev[day].isOpen ? prev[day].endHour : "00:00",
      },
    }));
  };

  // handleSubmit: Handles form submission, sending the updated work hours to the server and closing the dialog.
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(workHours); // Log the work hours data before sending
    try {
      const response = await axios.post("/api/updateWorkHours", { workHours });
      alert(response.data.message);
      setOpen(false); // Close the dialog after submission
    } catch (error) {
      console.error("An error occurred while updating work hours:", error);
      alert("An error occurred while updating work hours");
    }
  };

  return (
    <div className={styles.container}> {/* Added class for the main container */}
      <button onClick={() => setOpen(true)} className={styles.button}>
        Manage Work Hours
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} className={styles.dialog}> {/* Added class for the dialog */}
        <DialogTitle className={styles.dialogTitle} style={{ fontSize: '1.3em' }}>Work Hours Management</DialogTitle> {/* Added class for the title */}
        <DialogContent className={styles.dialogContent}> {/* Added class for the content */}
          <TableContainer className={styles.tableContainer}> {/* Added class for the table container */}
            <Table className={styles.table}> {/* Added class for the table */}
              <TableHead>
                <TableRow>
                  <TableCell className={styles.tableCell} style={{ fontSize: '1.2em' }}>Day</TableCell> {/* Added class for table cell */}
                  <TableCell className={styles.tableCell} style={{ fontSize: '1.2em' }}>Open Hour</TableCell> {/* Added class for table cell */}
                  <TableCell className={styles.tableCell} style={{ fontSize: '1.2em' }}>Close Hour</TableCell> {/* Added class for table cell */}
                  <TableCell className={styles.tableCell} style={{ fontSize: '1.2em' }}>Status</TableCell> {/* Added class for table cell */}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(workHours).map((day) => (
                  <TableRow key={day} className={styles.tableRow}> {/* Added class for table row */}
                    <TableCell className={styles.tableCell} style={{ fontSize: '1em' }}>{day}</TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        value={workHours[day]?.startHour || ""}
                        onChange={(e) => handleStartHourChange(day, e)}
                        disabled={!workHours[day]?.isOpen}
                        className={styles.textField} 
                        inputProps={{ style: { fontSize: '1.2em' } }} // Make time input a bit bigger
                        />
                        {/* Added class for text field */}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        value={workHours[day]?.endHour || ""}
                        onChange={(e) => handleEndHourChange(day, e)}
                        disabled={!workHours[day]?.isOpen}
                        className={styles.textField} 
                        inputProps={{ style: { fontSize: '1.2em' } }} // Make time input a bit bigger
                        />
                        {/* Added class for text field */}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => toggleOpenStatus(day)}
                        className={styles.statusButton}
                        style={{ fontSize: '1.2em' }} // Make status button a bit bigger
                        >
                        {/* Existing class for status button*/}
                        {workHours[day]?.isOpen ? "Open" : "Closed"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions className={styles.dialogActions}> {/* Added class for dialog actions */}
          <Button onClick={() => setOpen(false)} className={styles.cancelButton} style={{ marginRight: "auto" , fontSize: '1em'}}>
             {/* Added class for cancel button */}
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className={styles.submitButton}
          style={{ fontSize: '1em' }}> {/* Added class for submit button */}
            Update Work Hours
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WorkHoursForm;