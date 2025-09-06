import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary', error, info);
  }
  handleReload = () => {
    this.setState({ hasError: false });
  };
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>Please try again</Text>
          <TouchableOpacity style={styles.btn} onPress={this.handleReload}>
            <Text style={styles.btnText}>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as any;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#555', marginBottom: 16 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#003893', borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});

