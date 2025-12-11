import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';

import { useAppStore } from '@/store/appStore';
import {
  HandModelResponse,
  PollResponse,
  SessionResponse,
  sharingApi,
} from '@/services/sharingApi';

const demoGlbBase64 = 'Z2xiLWRlbW8='; // base64("glb-demo")

export default function ShareScreen() {
  const { userId, displayName, setUser, setDisplayName } = useAppStore();

  const [session, setSession] = useState<SessionResponse | null>(null);
  const [joinCode, setJoinCode] = useState('');

  const [latestModel, setLatestModel] = useState<HandModelResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const lastSeenModelIdRef = useRef<string | null>(null);

  const isPartner = useMemo(() => {
    if (!userId || !session) return false;
    return session.partner_user_id === userId;
  }, [session, userId]);

  const ensureUser = async () => {
    try {
      setErrorText(null);
      const created = await sharingApi.createUser(displayName || 'User');
      setUser(created.id);
    } catch (e) {
      setErrorText('Failed to create user');
    }
  };

  const createSession = async () => {
    if (!userId) {
      setErrorText('Create a user first');
      return;
    }

    try {
      setErrorText(null);
      const created = await sharingApi.createSession(userId);
      setSession(created);
      setLatestModel(null);
      lastSeenModelIdRef.current = null;
    } catch (e) {
      setErrorText('Failed to create session');
    }
  };

  const joinSession = async () => {
    if (!userId) {
      setErrorText('Create a user first');
      return;
    }

    try {
      setErrorText(null);
      const joined = await sharingApi.joinSession(joinCode.trim(), userId);
      setSession(joined);
    } catch (e) {
      setErrorText('Failed to join session');
    }
  };

  const sendDemoModel = async () => {
    if (!userId || !session) {
      setErrorText('Create/join a session first');
      return;
    }

    try {
      setErrorText(null);
      const uploaded = await sharingApi.uploadModelBase64(session.id, userId, demoGlbBase64);
      setLatestModel(uploaded);
      lastSeenModelIdRef.current = uploaded.id;
    } catch (e) {
      setErrorText('Failed to upload model');
    }
  };

  const pollOnce = async () => {
    if (!session) return;

    try {
      setErrorText(null);
      const polled: PollResponse = await sharingApi.pollSession(
        session.id,
        lastSeenModelIdRef.current
      );
      setSession(polled.session);

      if (polled.has_new_model && polled.latest_model) {
        const meta = await sharingApi.getHandModel(polled.latest_model.id, userId);
        setLatestModel(meta);
        lastSeenModelIdRef.current = polled.latest_model.id;
      }
    } catch (e) {
      setErrorText('Polling failed');
    }
  };

  const confirmDelivery = async () => {
    if (!userId || !latestModel) return;

    try {
      setErrorText(null);
      const confirmed = await sharingApi.confirmDelivery(latestModel.id, userId);
      setLatestModel(confirmed);
    } catch (e) {
      setErrorText('Failed to confirm delivery');
    }
  };

  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      pollOnce();
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling, session?.id, userId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Your identity" />
        <Card.Content>
          <TextInput
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            mode="outlined"
          />
          <View style={styles.row}>
            <Button mode="contained" onPress={ensureUser} style={styles.rowItem}>
              Create user
            </Button>
            <Text variant="labelSmall" style={styles.mono}>
              {userId ? `ID: ${userId}` : 'No user yet'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Pairing session" />
        <Card.Content>
          <View style={styles.row}>
            <Button
              mode="contained"
              onPress={createSession}
              disabled={!userId}
              style={styles.rowItem}
            >
              Create session
            </Button>
          </View>

          {session ? (
            <View style={styles.sessionBox}>
              <Text variant="labelMedium">Session ID</Text>
              <Text style={styles.mono}>{session.id}</Text>
              <Divider style={styles.divider} />
              <Text variant="labelMedium">Share code</Text>
              <Text style={styles.mono}>{session.share_code}</Text>
              <Divider style={styles.divider} />
              <Text variant="labelMedium">Partner</Text>
              <Text style={styles.mono}>{session.partner_user_id ?? 'Not joined yet'}</Text>
            </View>
          ) : null}

          <Divider style={styles.divider} />

          <TextInput
            label="Join code"
            value={joinCode}
            onChangeText={setJoinCode}
            mode="outlined"
            autoCapitalize="characters"
          />
          <View style={styles.row}>
            <Button
              mode="outlined"
              onPress={joinSession}
              disabled={!userId || !joinCode.trim()}
              style={styles.rowItem}
            >
              Join
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Send to partner" />
        <Card.Content>
          <Text variant="bodySmall" style={styles.helpText}>
            Demo: this uploads a tiny base64 "GLB" payload. Wire this up to your real processed
            model later.
          </Text>
          <View style={styles.row}>
            <Button
              mode="contained"
              onPress={sendDemoModel}
              disabled={!userId || !session}
              style={styles.rowItem}
            >
              Send demo model
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Receive / confirm" />
        <Card.Content>
          <View style={styles.row}>
            <Button
              mode={isPolling ? 'contained' : 'outlined'}
              onPress={() => setIsPolling(!isPolling)}
              style={styles.rowItem}
            >
              {isPolling ? 'Stop polling' : 'Start polling'}
            </Button>
            <Button mode="outlined" onPress={pollOnce} disabled={!session} style={styles.rowItem}>
              Poll once
            </Button>
          </View>

          {latestModel ? (
            <View style={styles.sessionBox}>
              <Text variant="labelMedium">Latest model</Text>
              <Text style={styles.mono}>{latestModel.id}</Text>
              <Text variant="labelSmall">Retrieved: {latestModel.retrieved_at ? 'yes' : 'no'}</Text>
              <Text variant="labelSmall">Confirmed: {latestModel.confirmed_at ? 'yes' : 'no'}</Text>
              <Divider style={styles.divider} />
              <Text variant="labelMedium">Download URL</Text>
              <Text selectable style={styles.mono}>
                {latestModel.download_url ?? 'No URL'}
              </Text>

              <View style={styles.row}>
                <Button
                  mode="contained"
                  onPress={confirmDelivery}
                  disabled={!isPartner || !!latestModel.confirmed_at}
                  style={styles.rowItem}
                >
                  Confirm delivery
                </Button>
              </View>
              {!isPartner ? (
                <Text variant="bodySmall" style={styles.helpText}>
                  Only the partner can confirm delivery.
                </Text>
              ) : null}
            </View>
          ) : (
            <Text variant="bodySmall" style={styles.helpText}>
              No model received yet.
            </Text>
          )}

          {errorText ? (
            <Text variant="bodySmall" style={styles.error}>
              {errorText}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rowItem: {
    marginRight: 12,
    marginBottom: 8,
  },
  sessionBox: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  divider: {
    marginVertical: 12,
  },
  mono: {
    fontFamily: 'monospace',
  },
  helpText: {
    opacity: 0.7,
  },
  error: {
    marginTop: 12,
    color: '#b00020',
  },
});
