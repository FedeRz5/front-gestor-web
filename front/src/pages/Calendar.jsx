"use client"

import { useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import api from "../api/client"
import Header from "../components/Header"

// Util para prompt simplificado
async function quickPrompt(message, initial = "") {
  const v = window.prompt(message, initial)
  if (v === null) return null
  return v.trim()
}

export default function Calendar() {
  const calRef = useRef(null)

  // cargar eventos desde backend
  const eventsFetcher = async (info, successCb, failureCb) => {
    try {
      const res = await api.get("/events", {
        params: { start: info.startStr, end: info.endStr },
      })
      successCb(res.data || [])
    } catch (e) {
      console.error(e)
      failureCb(e)
    }
  }

  // crear evento clickeando en un slot
  const handleDateSelect = async (selectInfo) => {
    const title = await quickPrompt("Título del evento:")
    if (!title) return selectInfo.view.calendar.unselect()

    try {
      const payload = {
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      }
      const res = await api.post("/events", payload)
      selectInfo.view.calendar.addEvent(res.data)
    } catch (e) {
      console.error(e)
      alert("No se pudo crear el evento")
    } finally {
      selectInfo.view.calendar.unselect()
    }
  }

  // drag & drop o resize
  const handleEventChange = async (changeInfo) => {
    const e = changeInfo.event
    try {
      await api.put(`/events/${e.id}`, {
        start: e.start?.toISOString(),
        end: e.end?.toISOString() || null,
        allDay: e.allDay,
      })
    } catch (err) {
      console.error(err)
      alert("No se pudo actualizar. Se revierte el cambio.")
      changeInfo.revert()
    }
  }

  // click en evento para editar / borrar
  const handleEventClick = async (clickInfo) => {
    const e = clickInfo.event
    const action = window.prompt(
      `Editar título o escribir "BORRAR" para eliminar:\n\nActual: ${e.title}`,
      e.title
    )
    if (action === null) return

    if (action.toUpperCase() === "BORRAR") {
      if (!window.confirm("¿Eliminar evento?")) return
      try {
        await api.delete(`/events/${e.id}`)
        e.remove()
      } catch (err) {
        console.error(err)
        alert("No se pudo eliminar")
      }
      return
    }

    const newTitle = action.trim()
    if (!newTitle) return
    try {
      await api.put(`/events/${e.id}`, { title: newTitle })
      e.setProp("title", newTitle)
    } catch (err) {
      console.error(err)
      alert("No se pudo editar")
    }
  }

  return (
    <div className="main-content-dashboard">
      <Header />
      <div className="calendar-page" style={{ padding: 16, paddingTop: 0 }}>
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="calc(100vh - 120px)"
          selectable={true}
          selectMirror={true}
          select={handleDateSelect}
          editable={true}
          eventChange={handleEventChange}
          eventClick={handleEventClick}
          events={eventsFetcher}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          nowIndicator={true}
          locale="es"
          firstDay={1}
        />
      </div>
    </div>
  )
}