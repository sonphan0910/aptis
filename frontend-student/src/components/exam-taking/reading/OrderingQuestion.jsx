'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ReadingOrderingQuestion({ question, onAnswerChange }) {
  const [sourceItems, setSourceItems] = useState([]);
  const [orderedItems, setOrderedItems] = useState([]);

  useEffect(() => {
    // Filter out instruction items (usually item_order === 0 or answer_text === 0)
    const orderableItems = question.items?.filter(item => {
      const position = parseInt(item.answer_text || item.item_order || 0);
      return position > 0;
    }) || [];

    if (!orderableItems || orderableItems.length === 0) {
      return;
    }

    // Create item map for quick lookup
    const allItems = orderableItems.map(item => ({
      id: item.id,
      text: item.item_text,
      original_order: parseInt(item.answer_text || item.item_order || 0)
    }));

    // Check if there's a saved answer to restore
    if (question.answer_data?.answer_json) {
      try {
        const parsedAnswer = JSON.parse(question.answer_data.answer_json);
        if (parsedAnswer.ordered_items && Array.isArray(parsedAnswer.ordered_items)) {
          // Get the IDs of ordered items
          const orderedIds = new Set(parsedAnswer.ordered_items.map(item => item.id));

          // Separate items into ordered and source
          const restoredOrdered = parsedAnswer.ordered_items;
          const restoredSource = allItems.filter(item => !orderedIds.has(item.id));

          setOrderedItems(restoredOrdered);
          setSourceItems(restoredSource);
          return;
        }
      } catch (error) {
        console.error('[ReadingOrderingQuestion] Error parsing answer_json:', error);
      }
    }

    // No saved answer, initialize all items in source
    setSourceItems(allItems);
    setOrderedItems([]);
  }, [question.id, question.answer_data?.answer_json, question.items]);


  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'source') {
        const items = Array.from(sourceItems);
        const [removed] = items.splice(source.index, 1);
        items.splice(destination.index, 0, removed);
        setSourceItems(items);
      } else {
        const items = Array.from(orderedItems);
        const [removed] = items.splice(source.index, 1);
        items.splice(destination.index, 0, removed);
        setOrderedItems(items);

        onAnswerChange({
          answer_type: 'json',
          answer_json: JSON.stringify({ ordered_items: items })
        });
      }
    } else {
      // Moving between lists
      if (source.droppableId === 'source') {
        const sourceClone = Array.from(sourceItems);
        const destClone = Array.from(orderedItems);
        const [removed] = sourceClone.splice(source.index, 1);
        destClone.splice(destination.index, 0, removed);

        setSourceItems(sourceClone);
        setOrderedItems(destClone);

        onAnswerChange({
          answer_type: 'json',
          answer_json: JSON.stringify({ ordered_items: destClone })
        });
      } else {
        const sourceClone = Array.from(orderedItems);
        const destClone = Array.from(sourceItems);
        const [removed] = sourceClone.splice(source.index, 1);
        destClone.splice(destination.index, 0, removed);

        setOrderedItems(sourceClone);
        setSourceItems(destClone);

        onAnswerChange({
          answer_type: 'json',
          answer_json: JSON.stringify({ ordered_items: sourceClone })
        });
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 2 }}>
      <Box sx={{ maxWidth: '1100px', width: '100%' }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={4}>
            {/* Source Items */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                All sentences have been ordered:
              </Typography>
              <Droppable droppableId="source">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      minHeight: 450,
                      p: 2,
                      backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : '#fafafa',
                      border: '2px dashed',
                      borderColor: snapshot.isDraggingOver ? '#2196f3' : '#ccc',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {sourceItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={`source-${item.id}`} index={index}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={snapshot.isDragging ? 4 : 1}
                            sx={{
                              p: 2,
                              mb: 2,
                              cursor: 'grab',
                              userSelect: 'none',
                              backgroundColor: snapshot.isDragging ? '#bbdefb' : 'white',
                              border: '1px solid',
                              borderColor: snapshot.isDragging ? '#2196f3' : '#e0e0e0',
                              borderRadius: 1.5,
                              '&:active': {
                                cursor: 'grabbing'
                              },
                              '&:hover': {
                                borderColor: '#2196f3'
                              }
                            }}
                          >
                            <Typography variant="body2">
                              {item.text}
                            </Typography>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {sourceItems.length === 0 && (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        Tất cả câu đã được sắp xếp
                      </Typography>
                    )}
                  </Box>
                )}
              </Droppable>
            </Grid>

            {/* Ordered Items */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Ordered sequence:
              </Typography>
              <Droppable droppableId="ordered">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      minHeight: 450,
                      p: 2,
                      backgroundColor: snapshot.isDraggingOver ? '#e8f5e9' : 'white',
                      border: '2px solid',
                      borderColor: snapshot.isDraggingOver ? '#4caf50' : '#e0e0e0',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      boxShadow: snapshot.isDraggingOver ? '0 4px 12px rgba(76, 175, 80, 0.1)' : 'none'
                    }}
                  >
                    {orderedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={`ordered-${item.id}`} index={index}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={snapshot.isDragging ? 4 : 2}
                            sx={{
                              p: 2,
                              mb: 2,
                              cursor: 'grab',
                              userSelect: 'none',
                              backgroundColor: snapshot.isDragging ? '#c8e6c9' : 'white',
                              border: '1px solid',
                              borderColor: snapshot.isDragging ? '#4caf50' : '#e0e0e0',
                              borderRadius: 1.5,
                              '&:active': {
                                cursor: 'grabbing'
                              }
                            }}
                          >
                            <Typography variant="body2">
                              <strong>{index + 1}.</strong> {item.text}
                            </Typography>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {orderedItems.length === 0 && (
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        Drag sentences here to order
                      </Typography>
                    )}
                  </Box>
                )}
              </Droppable>
            </Grid>
          </Grid>
        </DragDropContext>
      </Box>
    </Box>
  );
}
