import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { COLOR_OPTIONS, ICON_OPTIONS } from '@/lib/constants'
import { useSubjects } from '@/hooks/useSubjects'

export interface CreateSubjectModalProps {
  visible: boolean
  onClose: () => void
}

export function CreateSubjectModal({ visible, onClose }: CreateSubjectModalProps) {
  const { createSubject } = useSubjects()

  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0] || '#3B82F6')
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0] || '📚')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!name.trim()) return

    setError(null)
    setSubmitting(true)
    try {
      await createSubject({ name: name.trim(), color: selectedColor, icon: selectedIcon })
      // Reset form và đóng modal khi thành công
      setName('')
      setSelectedColor(COLOR_OPTIONS[0] || '#3B82F6')
      setSelectedIcon(ICON_OPTIONS[0] || '📚')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    if (submitting) return
    setError(null)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Tạo môn học mới</Text>

          {/* Tên môn */}
          <Text style={styles.label}>Tên môn học</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Vật lý đại cương"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            maxLength={50}
            editable={!submitting}
          />

          {/* Chọn màu */}
          <Text style={styles.label}>Màu sắc</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
                onPress={() => setSelectedColor(color)}
                disabled={submitting}
                activeOpacity={0.7}
              />
            ))}
          </View>

          {/* Chọn icon */}
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map(icon => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconBtn,
                  selectedIcon === icon && styles.iconBtnSelected,
                ]}
                onPress={() => setSelectedIcon(icon)}
                disabled={submitting}
                activeOpacity={0.7}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={submitting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: selectedColor },
                (!name.trim() || submitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || !name.trim()}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Tạo môn {selectedIcon}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBtnSelected: {
    borderColor: '#111827',
    backgroundColor: '#F3F4F6',
  },
  iconText: {
    fontSize: 22,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
})
