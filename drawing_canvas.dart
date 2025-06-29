// Automatic FlutterFlow imports
import '/backend/backend.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import '/custom_code/actions/index.dart'; // Imports custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_drawing_board/paint_extension.dart';
import 'package:flutter_drawing_board/flutter_drawing_board.dart';
import 'package:flutter_drawing_board/paint_contents.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'dart:convert';
import 'package:slider_button/slider_button.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:typed_data';
import 'dart:async';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;

// Constants for better maintainability
const double kControlPanelHeight = 230.0;
const double kMinStrokeWidth = 1.0;
const double kMaxStrokeWidth = 50.0;
const double kButtonRadius = 8.0;
const double kCanvasBorderWidth = 2.0;
const double kPreviewCircleSize = 30.0;
const Duration kDebounceDuration = Duration(milliseconds: 150);
const Duration kSnackBarDuration = Duration(seconds: 2);
const int kMaxUndoStack = 100;
double _currentCanvasHeight = 0;

enum DrawingTool { pen, eraser }

enum ShapeTool { none, pen, straightLine, rectangle, circle, triangle }

class DrawingCanvas extends StatefulWidget {
  final Future<dynamic> Function()? refreshUI;
  final double width;
  final double height;
  final Color? initialColor;
  final double? initialStrokeWidth;
  final bool? showGrid;

  const DrawingCanvas({
    Key? key,
    this.refreshUI,
    this.width = 300.0,
    this.height = 400.0,
    this.initialColor,
    this.initialStrokeWidth,
    this.showGrid = false,
  }) : super(key: key);

  @override
  DrawingCanvasState createState() => DrawingCanvasState();
}

class DrawingCanvasState extends State<DrawingCanvas> {
  late DrawingController _drawingController;
  Color _currentColor = Colors.black;
  Color _backgroundColor = Colors.white;
  bool _isEraser = false;
  double _strokeWidth = 2.0;
  DrawingTool _currentTool = DrawingTool.pen;
  bool _isLoading = false;
  String? _lastSavedDrawing;
  Timer? _debounce;
  bool _isCapturing = false;
  bool _isInternalChange = false;
  bool _isNewStrokeSession = false;

  List<Uint8List> _undoStack = [];
  List<Uint8List> _redoStack = [];

  final List<Color> _colorPalette = [
    Colors.black,
    Colors.red,
    Colors.blue,
    Colors.green,
    Colors.yellow,
    Colors.orange,
    Colors.purple,
    Colors.pink,
    Colors.brown,
    Colors.grey,
  ];

  ShapeTool _currentShapeTool = ShapeTool.none;

  @override
  void initState() {
    super.initState();
    _validateInputs();
    _initializeDrawing();
    _loadSettings();
  }

  void _validateInputs() {
    assert(widget.width > 0, 'Width must be positive');
    assert(widget.height > 200, 'Height must be at least 200');
    debugPrint(
        'Validating inputs: width=${widget.width}, height=${widget.height}');
  }

  void _initializeDrawing() {
    _drawingController = DrawingController();
    _currentColor = widget.initialColor ?? Colors.black;
    _strokeWidth =
        widget.initialStrokeWidth?.clamp(kMinStrokeWidth, kMaxStrokeWidth) ??
            2.0;
    _setDefaultStyle();

    _drawingController.addListener(_onDrawingChanged);

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      debugPrint('Initializing canvas state');
      await Future.delayed(const Duration(milliseconds: 100));
      await _saveCurrentState();
    });
  }

  void _onDrawingChanged() {
    if (!_isInternalChange) {
      _isNewStrokeSession = true;
      _saveCurrentStateDebounced();
    }
  }

  void _saveCurrentStateDebounced() {
    _debounce?.cancel();
    _debounce = Timer(kDebounceDuration, _saveCurrentState);
  }

  Future<void> _saveCurrentState() async {
    if (_isCapturing) return;
    _isCapturing = true;
    try {
      final imageData = await _drawingController.getImageData();
      if (imageData == null) {
        debugPrint('Failed to save state: imageData is null');
        return;
      }
      final Uint8List currentState = imageData.buffer.asUint8List();
      if (_undoStack.length >= kMaxUndoStack) {
        _undoStack.removeAt(0);
        _showSnackBar(
            'Undo history limit reached', FlutterFlowTheme.of(context).warning);
      }
      _undoStack.add(currentState);
      if (_isNewStrokeSession) {
        _redoStack.clear();
        _isNewStrokeSession = false;
      }
    } catch (e, stackTrace) {
      debugPrint('Error saving state: $e\n$stackTrace');
    } finally {
      _isCapturing = false;
    }
  }

  Future<void> _loadSettings() async {
    if (kIsWeb) {
      debugPrint('SharedPreferences limited on web; using defaults');
      _setDefaultValues();
      return;
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      if (!mounted) return;

      final colorValue = prefs.getInt('drawing_color');
      final strokeValue = prefs.getDouble('stroke_width');
      final bgColorValue = prefs.getInt('bg_color');

      setState(() {
        if (colorValue != null) _currentColor = Color(colorValue);
        if (strokeValue != null)
          _strokeWidth = strokeValue.clamp(kMinStrokeWidth, kMaxStrokeWidth);
        if (bgColorValue != null) _backgroundColor = Color(bgColorValue);
      });
      _setDefaultStyle();
      debugPrint('Settings loaded: color=$_currentColor, stroke=$_strokeWidth');
    } catch (e, stackTrace) {
      debugPrint('Error loading settings: $e\n$stackTrace');
      _setDefaultValues();
    }
  }

  void _setDefaultValues() {
    _currentColor = widget.initialColor ?? Colors.black;
    _strokeWidth =
        widget.initialStrokeWidth?.clamp(kMinStrokeWidth, kMaxStrokeWidth) ??
            2.0;
    _backgroundColor = Colors.white;
    _setDefaultStyle();
  }

  Future<void> _saveSettings() async {
    if (kIsWeb) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('drawing_color', _currentColor.value);
      await prefs.setDouble('stroke_width', _strokeWidth);
      await prefs.setInt('bg_color', _backgroundColor.value);
      debugPrint('Settings saved');
    } catch (e, stackTrace) {
      debugPrint('Error saving settings: $e\n$stackTrace');
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _drawingController.removeListener(_onDrawingChanged);
    _saveSettings().whenComplete(() {
      if (mounted) _drawingController.dispose();
    });
    super.dispose();
  }

  void _setDefaultStyle() {
    _drawingController.setStyle(
      color: _isEraser ? _backgroundColor : _currentColor,
      strokeWidth: _strokeWidth,
      style: PaintingStyle.stroke,
      strokeCap: StrokeCap.round,
      strokeJoin: StrokeJoin.round,
      isAntiAlias: true,
    );
    if (_isEraser) {
      _drawingController.setPaintContent(kIsWeb ? SimpleLine() : Eraser());
    } else {
      switch (_currentShapeTool) {
        case ShapeTool.none:
        case ShapeTool.pen:
          _drawingController.setPaintContent(SimpleLine());
          break;
        case ShapeTool.straightLine:
          _drawingController.setPaintContent(StraightLine());
          break;
        case ShapeTool.rectangle:
          _drawingController.setPaintContent(Rectangle());
          break;
        case ShapeTool.circle:
          _drawingController.setPaintContent(Circle());
          break;
        case ShapeTool.triangle:
          _drawingController.setPaintContent(CustomTriangle());
          break;
      }
    }
  }

  void _changeColor(Color color) {
    if (_currentColor == color) return;
    if (!kIsWeb) HapticFeedback.lightImpact();
    setState(() {
      _currentColor = color;
      _isEraser = false;
      _currentTool = DrawingTool.pen;
      _currentShapeTool = ShapeTool.pen;
      _setDefaultStyle();
    });
  }

  void _changeBackgroundColor(Color color) {
    if (_backgroundColor == color) return;
    if (!kIsWeb) HapticFeedback.lightImpact();
    setState(() {
      _backgroundColor = color;
      if (_isEraser) _setDefaultStyle();
    });
  }

  void _changeStrokeWidth(double width) {
    if (_strokeWidth == width) return;
    _debounce?.cancel();
    _debounce = Timer(kDebounceDuration, () {
      if (!mounted) return;
      if (!kIsWeb) HapticFeedback.lightImpact();
      setState(() {
        _strokeWidth = width;
        _setDefaultStyle();
      });
    });
  }

  void _toggleEraser() {
    if (!kIsWeb) HapticFeedback.lightImpact();
    setState(() {
      _isEraser = !_isEraser;
      _currentTool = _isEraser ? DrawingTool.eraser : DrawingTool.pen;
      _currentShapeTool = ShapeTool.none;
      _setDefaultStyle();
    });
  }

  void _selectShapeTool(ShapeTool shapeTool) {
    if (!kIsWeb) HapticFeedback.lightImpact();
    setState(() {
      _isEraser = false;
      _currentTool = DrawingTool.pen;
      _currentShapeTool = shapeTool;
      _setDefaultStyle();
    });
  }

  void _showColorPicker({bool isBackground = false}) {
    if (!mounted) return;
    Color pickerColor = isBackground ? _backgroundColor : _currentColor;

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text(
                isBackground ? 'Pick Background Color' : 'Pick Drawing Color',
                style:
                    TextStyle(color: FlutterFlowTheme.of(context).primaryText),
              ),
              backgroundColor: FlutterFlowTheme.of(context).secondaryBackground,
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _colorPalette.map((color) {
                        return GestureDetector(
                          onTap: () {
                            if (!kIsWeb) HapticFeedback.lightImpact();
                            setDialogState(() {
                              pickerColor = color;
                            });
                          },
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: color == pickerColor
                                    ? Colors.white
                                    : FlutterFlowTheme.of(context).alternate,
                                width: color == pickerColor ? 3 : 1,
                              ),
                              boxShadow: [
                                if (color == pickerColor)
                                  BoxShadow(
                                    color: FlutterFlowTheme.of(context)
                                        .alternate
                                        .withOpacity(0.3),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    ColorPicker(
                      pickerColor: pickerColor,
                      onColorChanged: (Color color) {
                        setDialogState(() {
                          pickerColor = color;
                        });
                      },
                      labelTypes: const [],
                      pickerAreaHeightPercent: 0.6,
                      paletteType: PaletteType.hueWheel,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  child: Text('Cancel',
                      style: TextStyle(
                          color: FlutterFlowTheme.of(context).secondaryText)),
                  onPressed: () => Navigator.of(context).pop(),
                ),
                TextButton(
                  child: Text('Apply',
                      style: TextStyle(
                          color: FlutterFlowTheme.of(context).primary)),
                  onPressed: () {
                    if (isBackground) {
                      _changeBackgroundColor(pickerColor);
                    } else {
                      _changeColor(pickerColor);
                    }
                    Navigator.of(context).pop();
                  },
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<bool> _saveDrawing() async {
    if (!mounted || _isLoading) return false;
    setState(() => _isLoading = true);
    try {
      if (kIsWeb) {
        _showSnackBar('Saving not supported on web',
            FlutterFlowTheme.of(context).warning);
        return false;
      }

      final imageBytes = await _drawingController.getImageData();
      if (imageBytes == null) {
        debugPrint('Save failed: imageBytes is null');
        _showSnackBar(
            'Failed to capture drawing', FlutterFlowTheme.of(context).error);
        return false;
      }

      final base64Image = base64Encode(imageBytes.buffer.asUint8List());
      if (base64Image.isEmpty) {
        debugPrint('Save failed: base64Image is empty');
        _showSnackBar('Failed to generate image data',
            FlutterFlowTheme.of(context).error);
        return false;
      }

      try {
        FFAppState().update(() {
          FFAppState().drawingImage = base64Image;
        });
        debugPrint('FFAppState updated with base64Image');
      } catch (e, stackTrace) {
        debugPrint('Error updating FFAppState: $e\n$stackTrace');
        _showSnackBar(
            'Error saving to app state', FlutterFlowTheme.of(context).error);
        return false;
      }

      setState(() => _lastSavedDrawing = base64Image);

      if (widget.refreshUI != null) {
        await widget.refreshUI!();
        debugPrint('refreshUI called');
      }

      _showSnackBar(
          'Drawing saved successfully!', FlutterFlowTheme.of(context).success);
      if (!kIsWeb) HapticFeedback.mediumImpact();
      return true;
    } catch (e, stackTrace) {
      debugPrint('Error saving drawing: $e\n$stackTrace');
      _showSnackBar('Error saving drawing', FlutterFlowTheme.of(context).error);
      return false;
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: color,
        duration: kSnackBarDuration,
      ),
    );
  }

  Future<ui.Image?> _uint8ListToImage(Uint8List data) async {
    try {
      final completer = Completer<ui.Image>();
      ui.decodeImageFromList(data, (ui.Image image) {
        completer.complete(image);
      });
      return await completer.future;
    } catch (e, stackTrace) {
      debugPrint('Error converting Uint8List to ui.Image: $e\n$stackTrace');
      return null;
    }
  }

  Future<void> _undo() async {
    if (!_canUndo()) return;
    if (!kIsWeb) HapticFeedback.lightImpact();
    try {
      _isInternalChange = true;
      final currentImageData = await _drawingController.getImageData();
      if (currentImageData != null) {
        _redoStack.add(currentImageData.buffer.asUint8List());
      }
      _undoStack.removeLast();
      await _restoreFrom(_undoStack.isNotEmpty ? _undoStack.last : null);
    } catch (e, stackTrace) {
      debugPrint('Error during undo: $e\n$stackTrace');
    } finally {
      _isInternalChange = false;
      setState(() {});
    }
  }

  Future<void> _redo() async {
    if (!_canRedo()) return;
    if (!kIsWeb) HapticFeedback.lightImpact();
    try {
      _isInternalChange = true;
      final currentImageData = await _drawingController.getImageData();
      if (currentImageData != null) {
        _undoStack.add(currentImageData.buffer.asUint8List());
      }
      final nextState = _redoStack.removeLast();
      await _restoreFrom(nextState);
    } catch (e, stackTrace) {
      debugPrint('Error during redo: $e\n$stackTrace');
    } finally {
      _isInternalChange = false;
      setState(() {});
    }
  }


  Future<void> _restoreFrom(Uint8List? bytes) async {
    if (bytes == null) return;
    try {
      _drawingController.clear();
      final image = await _uint8ListToImage(bytes);
      if (image != null) {
        final canvasHeight = _currentCanvasHeight > 0
            ? _currentCanvasHeight
            : widget.height - kControlPanelHeight;
        _drawingController.addContent(
          ImageContent(
            image,
            startPoint: Offset.zero,
            size: Offset(widget.width, canvasHeight),
          ),
        );
      }
    } catch (e, stackTrace) {
      debugPrint('Error restoring from bytes: $e\n$stackTrace');
    }
  }

  bool _canUndo() => _undoStack.length > 1;
  bool _canRedo() => _redoStack.isNotEmpty;

  void _clear() {
    if (!mounted) return;
    if (!kIsWeb) HapticFeedback.lightImpact();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Clear Drawing',
              style:
                  TextStyle(color: FlutterFlowTheme.of(context).primaryText)),
          content:
              const Text('Are you sure you want to clear the entire drawing?'),
          backgroundColor: FlutterFlowTheme.of(context).secondaryBackground,
          actions: [
            TextButton(
              child: Text('Cancel',
                  style:
                      TextStyle(color: FlutterFlowTheme.of(context).primary)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: Text('Clear',
                  style: TextStyle(color: FlutterFlowTheme.of(context).error)),
              onPressed: () {
                _isInternalChange = true;
                _drawingController.clear();
                _isInternalChange = false;
                _undoStack.clear();
                _redoStack.clear();
                setState(() => _backgroundColor = Colors.white);
                _saveCurrentState();
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildToolButton({
    required VoidCallback onPressed,
    IconData? icon,
    String? imagePath,
    Color? backgroundColor,
    Color? iconColor,
    bool isSelected = false,
    required String tooltip,
    bool enabled = true,
  }) {
    return Expanded(
      child: AspectRatio(
        aspectRatio: 1,
        child: Semantics(
          label: tooltip,
          enabled: enabled,
          button: true,
          child: Tooltip(
            message: tooltip,
            child: ElevatedButton(
              onPressed: enabled
                  ? () {
                      if (!kIsWeb) HapticFeedback.lightImpact();
                      onPressed();
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.zero,
                backgroundColor: backgroundColor ?? Colors.transparent,
                disabledBackgroundColor: FlutterFlowTheme.of(context).alternate,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(kButtonRadius),
                ),
                side: isSelected
                    ? BorderSide(
                        color: FlutterFlowTheme.of(context).primaryText,
                        width: 2,
                      )
                    : BorderSide.none,
                elevation: isSelected ? 4 : 2,
                minimumSize: const Size(48, 48),
              ),
              child: Center(
                child: imagePath != null
                    ? Image.asset(
                        imagePath,
                        width: 32,
                        height: 32,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          debugPrint(
                              'Error loading image: $imagePath, error: $error');
                          return Icon(
                            imagePath.contains('brush')
                                ? Icons.brush
                                : imagePath.contains('eraser')
                                    ? Icons.cleaning_services
                                    : imagePath.contains('undo')
                                        ? Icons.undo
                                        : imagePath.contains('redo')
                                            ? Icons.redo
                                            : imagePath.contains('trash')
                                                ? Icons.delete_outline
                                                : imagePath.contains('line')
                                                    ? Icons.horizontal_rule
                                                    : imagePath
                                                            .contains('square')
                                                        ? Icons.crop_square
                                                        : imagePath.contains(
                                                                'circle')
                                                            ? Icons
                                                                .circle_outlined
                                                            : imagePath.contains(
                                                                    'triangle')
                                                                ? Icons
                                                                    .change_history_rounded
                                                                : imagePath.contains(
                                                                        'palette')
                                                                    ? Icons
                                                                        .palette
                                                                    : imagePath.contains(
                                                                            'fill')
                                                                        ? Icons
                                                                            .format_color_fill
                                                                        : Icons
                                                                            .error,
                            size: 32,
                            color: iconColor ??
                                FlutterFlowTheme.of(context).secondaryText,
                          );
                        },
                      )
                    : Icon(
                        icon,
                        color: iconColor,
                        size: 32,
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getIconFromPath(String path) {
    switch (path) {
      case 'assets/images/palette.png':
        return Icons.palette;
      case 'assets/images/brush.png':
        return Icons.brush;
      case 'assets/images/eraser.png':
        return Icons.cleaning_services;
      case 'assets/images/undo.png':
        return Icons.undo;
      case 'assets/images/redo.png':
        return Icons.redo;
      case 'assets/images/trash.png':
        return Icons.delete_outline;
      case 'assets/images/line.png':
        return Icons.horizontal_rule;
      case 'assets/images/square.png':
        return Icons.crop_square;
      case 'assets/images/circle.png':
        return Icons.circle_outlined;
      case 'assets/images/triangle.png':
        return Icons.change_history_rounded;
      case 'assets/images/fill.png':
        return Icons.format_color_fill;
      default:
        return Icons.error;
    }
  }

  Widget _buildGridBackground(double canvasHeight) {
    if (!widget.showGrid!) return Container();
    return CustomPaint(
      size: Size(widget.width, canvasHeight),
      painter: GridPainter(),
    );
  }

  Widget _buildCanvas(double canvasHeight) {
    debugPrint('Building canvas: width=${widget.width}, height=$canvasHeight');
    return Container(
      width: widget.width,
      height: canvasHeight,
      decoration: BoxDecoration(
        border: Border.all(
            color: FlutterFlowTheme.of(context).alternate,
            width: kCanvasBorderWidth),
        borderRadius: BorderRadius.circular(kButtonRadius),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(kButtonRadius - 2),
        child: InteractiveViewer(
          boundaryMargin: const EdgeInsets.all(20),
          minScale: 0.5,
          maxScale: 3.0,
          child: Stack(
            children: [
              DrawingBoard(
                controller: _drawingController,
                background: Container(
                  width: widget.width,
                  height: canvasHeight,
                  color: _backgroundColor,
                  child: _buildGridBackground(canvasHeight),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToolbar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildToolButton(
          onPressed: () => _showColorPicker(),
          imagePath: 'assets/images/palette.png',
          backgroundColor: _currentColor,
          iconColor: _currentColor.computeLuminance() > 0.5
              ? FlutterFlowTheme.of(context).primaryText
              : FlutterFlowTheme.of(context).secondaryText,
          tooltip: 'Drawing Color',
        ),
        _buildToolButton(
          onPressed: _toggleEraser,
          imagePath: _isEraser
              ? 'assets/images/brush.png'
              : 'assets/images/eraser.png',
          isSelected: _isEraser,
          tooltip: _isEraser ? 'Switch to Pen' : 'Eraser',
        ),
        _buildToolButton(
          onPressed: _undo,
          imagePath: 'assets/images/undo.png',
          enabled: _canUndo(),
          tooltip: 'Undo',
        ),
        _buildToolButton(
          onPressed: _redo,
          imagePath: 'assets/images/redo.png',
          enabled: _canRedo(),
          tooltip: 'Redo',
        ),
        _buildToolButton(
          onPressed: _clear,
          imagePath: 'assets/images/trash.png',
          tooltip: 'Clear All',
        ),
      ],
    );
  }

  Widget _buildShapesToolbar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildToolButton(
          onPressed: () => _showColorPicker(isBackground: true),
          imagePath: 'assets/images/fill.png',
          backgroundColor: _backgroundColor,
          iconColor: _backgroundColor.computeLuminance() > 0.5
              ? FlutterFlowTheme.of(context).primaryText
              : FlutterFlowTheme.of(context).secondaryText,
          tooltip: 'Background Color',
        ),
        _buildToolButton(
          onPressed: () => _selectShapeTool(ShapeTool.straightLine),
          imagePath: 'assets/images/line.png',
          isSelected: _currentShapeTool == ShapeTool.straightLine,
          tooltip: 'Straight Line',
        ),
        _buildToolButton(
          onPressed: () => _selectShapeTool(ShapeTool.rectangle),
          imagePath: 'assets/images/square.png',
          isSelected: _currentShapeTool == ShapeTool.rectangle,
          tooltip: 'Rectangle',
        ),
        _buildToolButton(
          onPressed: () => _selectShapeTool(ShapeTool.circle),
          imagePath: 'assets/images/circle.png',
          isSelected: _currentShapeTool == ShapeTool.circle,
          tooltip: 'Circle',
        ),
        _buildToolButton(
          onPressed: () => _selectShapeTool(ShapeTool.triangle),
          imagePath: 'assets/images/triangle.png',
          isSelected: _currentShapeTool == ShapeTool.triangle,
          tooltip: 'Triangle',
        ),
      ],
    );
  }

  Widget _buildStrokeSlider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.line_weight,
              color: FlutterFlowTheme.of(context).secondaryText, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Slider(
              value: _strokeWidth,
              min: kMinStrokeWidth,
              max: kMaxStrokeWidth,
              divisions: (kMaxStrokeWidth - kMinStrokeWidth).toInt(),
              label: _strokeWidth.round().toString(),
              onChanged: _changeStrokeWidth,
              activeColor: FlutterFlowTheme.of(context).primary,
              inactiveColor: FlutterFlowTheme.of(context).alternate,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSaveButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 8.0),
      child: SliderButton(
        action: () async {
          debugPrint('SliderButton swiped');
          return await _saveDrawing();
        },
        label: Text(
          'Slide to Send',
          style: TextStyle(
              color: Color(0xFF4A4A4A),
              fontWeight: FontWeight.w500,
              fontSize: 17),
        ),
        icon: Center(
          child: Icon(Icons.send,
              color: Colors.white, size: 24, semanticLabel: 'Send drawing'),
        ),
        width: widget.width * 0.6,
        radius: 10,
        buttonColor: Color(0xFF00B3FF),
        backgroundColor: Color(0xFF534BAE),
        highlightedColor: Colors.white,
        baseColor: Color(0xFF00B3FF),
        shimmer: true,
        vibrationFlag: false,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    debugPrint('Building DrawingCanvas widget');
    return LayoutBuilder(
      builder: (context, constraints) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          debugPrint(
              'Constraints: maxHeight=${constraints.maxHeight}, maxWidth=${constraints.maxWidth}');
        });

        const controlPanelHeight = 200.0;
        final availableHeight = constraints.maxHeight;
        final canvasHeight = (availableHeight - controlPanelHeight)
            .clamp(200.0, double.infinity);
        _currentCanvasHeight = canvasHeight;

        return ConstrainedBox(
          constraints: BoxConstraints(minHeight: availableHeight),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: canvasHeight,
                width: widget.width, // Ensure consistent width
                child: _buildCanvas(canvasHeight),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 50,
                child: _buildToolbar(),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 50,
                child: _buildShapesToolbar(),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 50,
                child: _buildStrokeSlider(),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 50,
                child: _buildSaveButton(),
              ),
            ],
          ),
        );
      },
    );
  }
}

// Custom painter for grid background
class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.withOpacity(0.2)
      ..strokeWidth = 0.5;

    const double gridSize = 20.0;

    for (double x = 0; x <= size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    for (double y = 0; y <= size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom image content for drawing board
class ImageContent extends PaintContent {
  ImageContent(
    this.image, {
    required this.startPoint,
    required this.size,
  });

  final ui.Image image;
  Offset startPoint;
  Offset size;

  @override
  String get contentType => 'ImageContent';

  @override
  void startDraw(Offset startPoint) => this.startPoint = startPoint;

  @override
  void drawing(Offset nowPoint) => size = nowPoint;

  @override
  void draw(Canvas canvas, Size size, bool deeper) {
    final Rect rect = Rect.fromPoints(startPoint, startPoint + this.size);
    canvas.drawImageRect(
      image,
      Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble()),
      rect,
      Paint(),
    );
  }

  @override
  ImageContent copy() =>
      ImageContent(image, startPoint: startPoint, size: size);

  @override
  Map<String, dynamic> toContentJson() {
    return {
      'startPoint': {'dx': startPoint.dx, 'dy': startPoint.dy},
      'size': {'dx': size.dx, 'dy': size.dy},
      'paint': paint.toJson(),
    };
  }
}

// Custom triangle content
class CustomTriangle extends PaintContent {
  CustomTriangle();
  CustomTriangle.data({
    required this.startPoint,
    required this.A,
    required this.B,
    required this.C,
    required Paint paint,
  }) : super.paint(paint);

  factory CustomTriangle.fromJson(Map<String, dynamic> data) {
    return CustomTriangle.data(
      startPoint: jsonToOffset(data['startPoint']),
      A: jsonToOffset(data['A']),
      B: jsonToOffset(data['B']),
      C: jsonToOffset(data['C']),
      paint: jsonToPaint(data['paint']),
    );
  }

  Offset startPoint = Offset.zero;
  Offset A = Offset.zero;
  Offset B = Offset.zero;
  Offset C = Offset.zero;

  @override
  String get contentType => 'Triangle';

  @override
  void startDraw(Offset startPoint) => this.startPoint = startPoint;

  @override
  void drawing(Offset nowPoint) {
    double dx = nowPoint.dx - startPoint.dx;
    double dy = nowPoint.dy - startPoint.dy;

    A = Offset(startPoint.dx + dx * 0.5, startPoint.dy - dy * 0.3);
    B = Offset(startPoint.dx - dx * 0.2, startPoint.dy + dy * 0.7);
    C = nowPoint;
  }

  @override
  void draw(Canvas canvas, Size size, bool deeper) {
    final Path path = Path()
      ..moveTo(A.dx, A.dy)
      ..lineTo(B.dx, B.dy)
      ..lineTo(C.dx, C.dy)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  CustomTriangle copy() => CustomTriangle();

  @override
  Map<String, dynamic> toContentJson() {
    return {
      'startPoint': startPoint.toJson(),
      'A': A.toJson(),
      'B': B.toJson(),
      'C': C.toJson(),
      'paint': paint.toJson(),
    };
  }
}

Offset jsonToOffset(Map<String, dynamic> data) {
  return Offset(
    (data['dx'] as num).toDouble(),
    (data['dy'] as num).toDouble(),
  );
}

Paint jsonToPaint(Map<String, dynamic> data) {
  return Paint()
    ..color = Color(data['color'])
    ..strokeWidth = (data['strokeWidth'] as num).toDouble()
    ..style = PaintingStyle.values[data['style']]
    ..strokeCap = StrokeCap.values[data['strokeCap']]
    ..strokeJoin = StrokeJoin.values[data['strokeJoin']]
    ..isAntiAlias = data['isAntiAlias'];
}
