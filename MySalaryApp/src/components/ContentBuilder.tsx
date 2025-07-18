import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { CarouselCard } from './ContentCarousel';
import { contentManager } from '../services/contentManager';
import { colors } from '../styles';

interface ContentBuilderProps {
  onSave: (content: any) => void;
  onCancel: () => void;
  editingContent?: any;
}

export const ContentBuilder: React.FC<ContentBuilderProps> = ({
  onSave,
  onCancel,
  editingContent,
}) => {
  const [title, setTitle] = useState(editingContent?.title || '');
  const [description, setDescription] = useState(editingContent?.description || '');
  const [category, setCategory] = useState(editingContent?.category || '');
  const [cards, setCards] = useState<CarouselCard[]>(editingContent?.cards || []);

  const addQuestionCard = () => {
    const newCard: CarouselCard = {
      id: `card_${Date.now()}`,
      type: 'question',
      title: 'New Question',
      content: '',
      question: 'Your question here?',
      options: [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' },
      ],
      correctAnswer: 'A',
      explanation: 'Explanation for the answer',
      gradient: ['#E8F4FD', '#B3E5FC'],
      illustration: '🤔',
      relatedContent: [],
    };
    setCards([...cards, newCard]);
  };

  const addInfoCard = () => {
    const newCard: CarouselCard = {
      id: `card_${Date.now()}`,
      type: 'info',
      title: 'New Info Card',
      content: 'Information content here',
      gradient: ['#F3E5F5', '#E1BEE7'],
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (index: number, updates: Partial<CarouselCard>) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], ...updates };
    setCards(updatedCards);
  };

  const removeCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index);
    setCards(updatedCards);
  };

  const saveContent = async () => {
    if (!title.trim() || !description.trim() || cards.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one card.');
      return;
    }

    try {
      const contentData = {
        title,
        description,
        category,
        tags: [],
        difficulty: 'beginner' as const,
        estimatedTime: cards.length * 2,
        cards,
        isActive: true,
      };

      if (editingContent) {
        await contentManager.updateContent(editingContent.id, contentData);
      } else {
        await contentManager.createContent(contentData);
      }

      onSave(contentData);
      Alert.alert('Success', 'Content saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save content. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Builder</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveContent}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter content title"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter content description"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g., Market Trends, Investment Tips"
        />

        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Cards ({cards.length})</Text>
          
          <View style={styles.addButtons}>
            <TouchableOpacity style={styles.addButton} onPress={addQuestionCard}>
              <Text style={styles.addButtonText}>+ Question Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={addInfoCard}>
              <Text style={styles.addButtonText}>+ Info Card</Text>
            </TouchableOpacity>
          </View>

          {cards.map((card, index) => (
            <View key={card.id} style={styles.cardEditor}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {card.type === 'question' ? '❓' : 'ℹ️'} Card {index + 1}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCard(index)}>
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                value={card.title}
                onChangeText={(text) => updateCard(index, { title: text })}
                placeholder="Card title"
              />

              {card.type === 'question' && (
                <>
                  <TextInput
                    style={styles.input}
                    value={card.question}
                    onChangeText={(text) => updateCard(index, { question: text })}
                    placeholder="Question text"
                  />
                  
                  <Text style={styles.label}>Options:</Text>
                  {card.options?.map((option, optIndex) => (
                    <View key={option.id} style={styles.optionRow}>
                      <Text style={styles.optionLabel}>{option.id}:</Text>
                      <TextInput
                        style={[styles.input, styles.optionInput]}
                        value={option.text}
                        onChangeText={(text) => {
                          const newOptions = [...(card.options || [])];
                          newOptions[optIndex] = { ...option, text };
                          updateCard(index, { options: newOptions });
                        }}
                        placeholder="Option text"
                      />
                    </View>
                  ))}

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={card.explanation}
                    onChangeText={(text) => updateCard(index, { explanation: text })}
                    placeholder="Explanation"
                    multiline
                    numberOfLines={2}
                  />
                </>
              )}

              {card.type === 'info' && (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={card.content}
                  onChangeText={(text) => updateCard(index, { content: text })}
                  placeholder="Information content"
                  multiline
                  numberOfLines={4}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cardsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  addButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cardEditor: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
    minWidth: 24,
  },
  optionInput: {
    flex: 1,
    marginLeft: 8,
  },
});