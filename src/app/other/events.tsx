import GenericScreen from "@/components/layout/GenericScreen";
import MonthlyCalendarView from "@/components/view/calendarView/MonthlyColendarView";
import LoadingIndicator from "@/components/view/LoadingIndicator";
import { spacing } from "@/configs/styles";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useVRChat } from "@/contexts/VRChatContext";
import { formatToDateStr, formatToTimeStr } from "@/libs/date";
import { extractErrMsg } from "@/libs/utils";
import { CalendarEvent, PaginatedCalendarEventList } from "@/vrchat/api";
import { Text } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";



export default function Events () {
  const auth = useAuth();
  const theme = useTheme();
  const vrc = useVRChat();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const eventsRef = useRef<CalendarEvent[]>([]);
  const [ eventsByDate, setEventsByDate ] = useState<Record<string, CalendarEvent[]>>({});
  const offset = useRef(0);
  const fetchingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const npr = 60;

  const getDateKey = (date: Date) => {
    const res = formatToDateStr(date);
    return res;
  }

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      const date = getDateKey(new Date(event.startsAt ?? ""))
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const fetchEvents = async () => {
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      while (fetchingRef.current) {
        const res = await vrc.calendarApi.getCalendarEvents({
          date: selectedDate.toISOString(), // month only affects the returned events
          n: npr,
          offset: offset.current,
        });
        const paginated: PaginatedCalendarEventList = res.data;
        if (paginated.results) {
          eventsRef.current = [...eventsRef.current, ...paginated.results ?? []];
        }
        if (paginated.hasNext && (paginated.totalCount ?? 0 > offset.current + npr)) {
          offset.current += npr;
        } else {
          setEventsByDate(groupEventsByDate(eventsRef.current)); // update grouped events
          fetchingRef.current = false;
          setIsLoading(false);
        }
      }
    } catch (e) {
      fetchingRef.current = false;
      setIsLoading(false);
      showToast("error", "Error fetching calendar events", extractErrMsg(e));
    }
  };

  const reload = () => {
    eventsRef.current = [];
    offset.current = 0;
    void fetchEvents();
  };

  useEffect(() => {
    reload();
  },[auth.user]);

  const selectedDateEvents = useMemo<CalendarEvent[]>(() => {
    const dateKey = getDateKey(selectedDate);
    return eventsByDate[dateKey] || [];
  }, [eventsByDate, selectedDate]);

  const renderDateContent = useCallback((date: Date) => {
    const dateKey = getDateKey(date);
    const events = eventsByDate[dateKey] || [];
    if (events.length > 0) {
      return (
        <Text style={{ fontSize: 10, color: theme.colors.warning, paddingHorizontal: spacing.mini }}>
          {`${events.length} event${events.length > 1 ? "s" : ""}`}
        </Text>
      );
    }
    return null;
  }, [eventsByDate])

  return (
    <GenericScreen >
      {isLoading && <LoadingIndicator absolute />}

      <MonthlyCalendarView
        initialDate={selectedDate}
        onSelectDate={setSelectedDate}
        renderDateContent={renderDateContent}
      />
      <Text style={[{ marginTop: spacing.medium, marginLeft: spacing.small, color: theme.colors.text, fontWeight: "bold", fontSize: 16 }]}>
        Events on {formatToDateStr(selectedDate)}
      </Text>
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
          />
        }
      >
      {selectedDateEvents.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: spacing.large }}>
          <Text style={{ color: theme.colors.text }}>No events on this date.</Text>
        </View>
      ) : (
        selectedDateEvents.map(event => (
          <View key={event.id} style={{ backgroundColor: theme.colors.card, padding: spacing.small, margin: spacing.small, borderRadius: 8 }}>
            <View style={{ paddingHorizontal: spacing.small, flexDirection: "row", gap: spacing.small, alignItems: "center" }}>
              <Text style={{ color: theme.colors.text, marginTop: spacing.mini }}>
                {`${event.startsAt ? formatToTimeStr(event.startsAt) : "N/A"} ~ ${event.endsAt ? formatToTimeStr(event.endsAt) : "N/A"}`}
              </Text>
              <View style={{ flex: 1 }} >
                <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold" }}>{event.title}</Text>
              </View>
            </View>
            <Text numberOfLines={3} style={{ color: theme.colors.subText, marginTop: spacing.mini, marginLeft: spacing.small }}>
              {event.description}
            </Text>
          </View>
        ))
      )}
      </ScrollView>  
    </GenericScreen>
  );
}