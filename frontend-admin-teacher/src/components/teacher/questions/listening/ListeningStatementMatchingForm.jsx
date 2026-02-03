import React from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    IconButton,
    Grid,
    Paper,
    Alert,
    Avatar,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    CheckCircle,
    Warning,
    Upload,
    AudioFile
} from '@mui/icons-material';

/**
 * APTIS Listening Statement Matching Form (Part 3)
 * Listen to a conversation (Dialogue) and identify who said what (Man, Woman, Both).
 */
const ListeningStatementMatchingForm = ({ questionData, onChange, onAudioFilesChange, onValidate, isEdit = false }) => {
    const [formData, setFormData] = React.useState({
        content: questionData?.content || '',
        title: questionData?.title || '',
        audioFile: null,
        audioUrl: questionData?.audioUrl || '',
        // For Statement Matching, "speakers" are usually fixed options like Man/Woman, but user can define.
        speakers: questionData?.speakers || [
            { id: 1, name: 'Man' },
            { id: 2, name: 'Woman' },
            { id: 3, name: 'Both' }
        ],
        statements: questionData?.statements || [
            { id: 1, statement: '', speaker_id: 1 }
        ],
        instructions: questionData?.instructions || 'Listen to the conversation and decide who expressed the following opinions.',
        difficulty: questionData?.difficulty || 'medium'
    });

    const [errors, setErrors] = React.useState({});
    const [isValidated, setIsValidated] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);

    // Sync audio files to parent whenever they change
    React.useEffect(() => {
        if (onAudioFilesChange) {
            onAudioFilesChange({
                mainAudio: formData.audioFile,
                speakerAudios: []
            });
        }
    }, [formData.audioFile, onAudioFilesChange]);

    // Main audio file selection handler
    const handleMainAudioFileSelect = (file) => {
        if (!file) return;

        // Clean up old object URL if it was a blob
        if (formData.audioUrl && formData.audioUrl.startsWith('blob:')) {
            URL.revokeObjectURL(formData.audioUrl);
        }

        const objectUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            audioFile: file,
            audioUrl: objectUrl
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';

        // Require Main Audio
        if (!formData.audioUrl && !formData.audioFile) {
            newErrors.audio = 'Bài nghe này bắt buộc phải có file Audio (Conversation)';
        }

        const validSpeakers = formData.speakers.filter(s => s.name.trim());
        if (validSpeakers.length < 2) {
            newErrors.speakers = 'Phải có ít nhất 2 lựa chọn (ví dụ: Man, Woman)';
        }

        const validStatements = formData.statements.filter(s => s.statement.trim());
        if (validStatements.length === 0) {
            newErrors.statements = 'Phải có ít nhất 1 câu nhận định';
        }

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        setIsValidated(isValid);

        if (isValid && onChange) {
            const structuredData = {
                speakers: validSpeakers.map(s => ({
                    name: s.name,
                    id: s.id
                })),
                statements: validStatements.map(statement => ({
                    text: statement.statement,
                    speaker: validSpeakers.find(s => s.id === statement.speaker_id)?.name || ''
                })),
                audioUrl: formData.audioUrl,
                instructions: formData.instructions.trim(),
                title: formData.title.trim()
            };

            onChange(JSON.stringify(structuredData));
        }

        return isValid;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSpeakerChange = (index, value) => {
        const newSpeakers = [...formData.speakers];
        newSpeakers[index].name = value;
        setFormData(prev => ({ ...prev, speakers: newSpeakers }));
    };

    // Speaker management (Add/Remove)
    const addSpeaker = () => {
        const newSpeaker = {
            id: Math.max(...formData.speakers.map(s => s.id), 0) + 1,
            name: `Option ${formData.speakers.length + 1}`
        };
        setFormData(prev => ({ ...prev, speakers: [...prev.speakers, newSpeaker] }));
    };

    const removeSpeaker = (index) => {
        if (formData.speakers.length <= 2) return;
        const newSpeakers = formData.speakers.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, speakers: newSpeakers }));
    };

    const handleStatementChange = (index, field, value) => {
        const newStatements = [...formData.statements];
        newStatements[index][field] = value;
        setFormData(prev => ({ ...prev, statements: newStatements }));
    };

    const addStatement = () => {
        const newStatement = {
            id: Math.max(...formData.statements.map(s => s.id), 0) + 1,
            statement: '',
            speaker_id: 1
        };
        setFormData(prev => ({ ...prev, statements: [...prev.statements, newStatement] }));
    };

    const removeStatement = (index) => {
        if (formData.statements.length <= 1) return;
        const newStatements = formData.statements.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, statements: newStatements }));
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Listening Statement Matching (Opinion Matching)
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
                Tạo bài nghe hội thoại và xác định ai là người nói câu đó (Part 3)
            </Typography>

            <TextField
                label="Tiêu đề bài nghe"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title}
            />

            {/* Main Audio Upload */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    File Audio (Hội thoại)
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AudioFile />}
                    >
                        {formData.audioUrl ? 'Thay đổi Audio' : 'Chọn Audio Hội thoại'}
                        <input type="file" hidden accept="audio/*" onChange={(e) => handleMainAudioFileSelect(e.target.files[0])} />
                    </Button>
                    {formData.audioFile && <Typography variant="body2">{formData.audioFile.name}</Typography>}
                </Box>
                {formData.audioUrl && (
                    <audio controls src={formData.audioUrl} style={{ width: '100%', marginTop: 16 }} />
                )}
                {errors.audio && <Typography color="error" variant="caption">{errors.audio}</Typography>}
            </Paper>

            {/* Options/Speakers Section */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Các lựa chọn (Speakers/Options)
                    </Typography>
                    <Button startIcon={<AddIcon />} onClick={addSpeaker} size="small">
                        Thêm lựa chọn
                    </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" mb={2} display="block">
                    Thường là: Man, Woman, hoặc Both. Không cần file audio riêng.
                </Typography>

                <Grid container spacing={2}>
                    {formData.speakers.map((speaker, index) => (
                        <Grid item xs={12} md={4} key={speaker.id}>
                            <Box display="flex" gap={1} alignItems="center">
                                <TextField
                                    label={`Lựa chọn ${index + 1}`}
                                    value={speaker.name}
                                    onChange={(e) => handleSpeakerChange(index, e.target.value)}
                                    size="small"
                                    fullWidth
                                />
                                <IconButton onClick={() => removeSpeaker(index)} color="error" disabled={formData.speakers.length <= 2}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Statements Section */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Danh sách câu nói (Statements)
                    </Typography>
                    <Button startIcon={<AddIcon />} onClick={addStatement} variant="outlined" size="small">
                        Thêm câu nói
                    </Button>
                </Box>

                {formData.statements.map((statement, index) => (
                    <Box key={statement.id} mb={2}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" gap={2} alignItems="flex-start">
                                    <TextField
                                        label={`Câu nói ${index + 1}`}
                                        value={statement.statement}
                                        onChange={(e) => handleStatementChange(index, 'statement', e.target.value)}
                                        multiline
                                        rows={2}
                                        size="small"
                                        fullWidth
                                        placeholder="Ví dụ: He thinks the price is too high."
                                    />
                                    <IconButton onClick={() => removeStatement(index)} color="error" disabled={formData.statements.length <= 1}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                                <FormControl margin="normal" size="small" fullWidth>
                                    <InputLabel>Đáp án đúng (Ai nói?)</InputLabel>
                                    <Select
                                        value={statement.speaker_id}
                                        label="Đáp án đúng (Ai nói?)"
                                        onChange={(e) => handleStatementChange(index, 'speaker_id', e.target.value)}
                                    >
                                        {formData.speakers.map(s => (
                                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
                {errors.statements && <Typography color="error" variant="caption">{errors.statements}</Typography>}
            </Paper>

            {/* Instructions */}
            <TextField
                label="Hướng dẫn chung"
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                fullWidth
                multiline
                rows={2}
                margin="normal"
            />

            <Button
                onClick={validateForm}
                variant="contained"
                color="info"
                size="small"
                sx={{ mb: 3, mt: 2 }}
                disabled={isUploading}
                startIcon={<CheckCircle />}
            >
                Kiểm tra & Lưu
            </Button>

            {isValidated && (
                <Alert severity="success" sx={{ mt: 2 }}>Câu hỏi hợp lệ!</Alert>
            )}
            {Object.keys(errors).length > 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>Vui lòng kiểm tra lại thông tin.</Alert>
            )}
        </Box>
    );
};

export default ListeningStatementMatchingForm;
