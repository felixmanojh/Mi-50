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

import '/flutter_flow/custom_functions.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_drawing_board/paint_extension.dart';
import 'package:flutter_drawing_board/flutter_drawing_board.dart';
import 'package:flutter_drawing_board/paint_contents.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:share_plus/share_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:typed_data';
import 'dart:async';
import 'package:flutter/services.dart';
import 'dart:ui' as ui;
import 'dart:io';

// Constants
const double kControlPanelHeight = 160.0; // Increased for iPad touch targets
const double kDefaultAspectRatio = 3 / 4; // Matches 300:400
const double kMinStrokeWidth = 1.0;
const double kMaxStrokeWidth = 50.0;
const double kButtonRadius = 8.0;
const double kCanvasBorderWidth = 2.0;
const Duration kDebounceDuration = Duration(milliseconds: 150);
const Duration kSnackBarDuration = Duration(seconds: 2);
const int kMaxUndoStack = 50; // Reduced for performance

enum DrawingTool { pen, eraser }

enum ShapeTool { none, pen, straightLine, rectangle, circle, triangle }

class PracticeDrawCanvas extends StatefulWidget {
  const PracticeDrawCanvas({
    Key? key,
    required this.saveImage,
    required this.shareImage,
    this.refreshUI,
    this.width = 300.0,
    this.height = 400.0,
    this.initialColor,
    this.initialStrokeWidth,
    this.showGrid = false,
  }) : super(key: key);

  final Future Function() saveImage;
  final Future Function() shareImage;
  final Future<dynamic> Function()? refreshUI;
  final double width;
  final double height;
  final Color? initialColor;
  final double? initialStrokeWidth;
  final bool showGrid;

  @override
  State<PracticeDrawCanvas> createState() => _PracticeDrawCanvasState();
}

class _PracticeDrawCanvasState extends State<PracticeDrawCanvas> {
  late DrawingController _drawingController;
  Color _currentColor = Colors.black;
  Color _backgroundColor = Colors.white;
  bool _isEraser = false;
  double _strokeWidth = 2.0;
  DrawingTool _currentTool = DrawingTool.pen;
  ShapeTool _currentShapeTool = ShapeTool.pen;
  bool _isLoading = false;
  Timer? _debounce;
  bool _isCapturing = false;
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

  @override
  void initState() {
    super.initState();
    _initializeDrawing();
    _loadSettings();
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
      await Future.delayed(const Duration(milliseconds: 100));
      await _saveCurrentState();
    });
  }

  void _onDrawingChanged() {
    if (!_isCapturing) _saveCurrentStateDebounced();
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
      if (imageData == null) return;
      if (_undoStack.length >= kMaxUndoStack) _undoStack.removeAt(0);
      _undoStack.add(imageData.buffer.asUint8List());
      _redoStack.clear();
    } catch (e) {
      debugPrint('Error saving state: $e');
    } finally {
      _isCapturing = false;
    }
  }

  Future<void> _loadSettings() async {
    if (kIsWeb) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        _currentColor =
            Color(prefs.getInt('drawing_color') ?? _currentColor.value);
        _strokeWidth = prefs
                .getDouble('stroke_width')
                ?.clamp(kMinStrokeWidth, kMaxStrokeWidth) ??
            _strokeWidth;
        _backgroundColor =
            Color(prefs.getInt('bg_color') ?? _backgroundColor.value);
      });
      _setDefaultStyle();
    } catch (e) {
      debugPrint('Error loading settings: $e');
    }
  }

  Future<void> _saveSettings() async {
    if (kIsWeb) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('drawing_color', _currentColor.value);
      await prefs.setDouble('stroke_width', _strokeWidth);
      await prefs.setInt('bg_color', _backgroundColor.value);
    } catch (e) {
      debugPrint('Error saving settings: $e');
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _drawingController.removeListener(_onDrawingChanged);
    _drawingController.dispose();
    _saveSettings();
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
    setState(() {
      _currentColor = color;
      _isEraser = false;
      _currentTool = DrawingTool.pen;
      _currentShapeTool = ShapeTool.pen;
      _setDefaultStyle();
    });
    if (!kIsWeb) HapticFeedback.lightImpact();
  }

  void _changeBackgroundColor(Color color) {
    setState(() {
      _backgroundColor = color;
      if (_isEraser) _setDefaultStyle();
    });
    if (!kIsWeb) HapticFeedback.lightImpact();
  }

  void _toggleEraser() {
    setState(() {
      _isEraser = !_isEraser;
      _currentTool = _isEraser ? DrawingTool.eraser : DrawingTool.pen;
      _currentShapeTool = ShapeTool.none;
      _setDefaultStyle();
    });
    if (!kIsWeb) HapticFeedback.lightImpact();
  }

  void _selectShapeTool(ShapeTool shapeTool) {
    setState(() {
      _isEraser = false;
      _currentTool = DrawingTool.pen;
      _currentShapeTool = shapeTool;
      _setDefaultStyle();
    });
    if (!kIsWeb) HapticFeedback.lightImpact();
  }

  void _showColorPicker({bool isBackground = false}) {
    Color pickerColor = isBackground ? _backgroundColor : _currentColor;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title:
            Text(isBackground ? 'Pick Background Color' : 'Pick Drawing Color'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _colorPalette
                    .map((color) => GestureDetector(
                          onTap: () => setState(() => pickerColor = color),
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: color == pickerColor
                                    ? Colors.white
                                    : Colors.grey,
                                width: color == pickerColor ? 3 : 1,
                              ),
                            ),
                          ),
                        ))
                    .toList(),
              ),
              SizedBox(height: 16),
              ColorPicker(
                pickerColor: pickerColor,
                onColorChanged: (color) => setState(() => pickerColor = color),
                labelTypes: [],
                pickerAreaHeightPercent: 0.6,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: Navigator.of(context).pop,
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (isBackground)
                _changeBackgroundColor(pickerColor);
              else
                _changeColor(pickerColor);
              Navigator.of(context).pop();
            },
            child: Text('Apply'),
          ),
        ],
      ),
    );
  }

  Future<bool> _saveDrawing() async {
    if (_isLoading || !mounted) return false;
    setState(() => _isLoading = true);
    try {
      if (kIsWeb) {
        _showSnackBar('Saving not supported on web');
        return false;
      }
      final imageBytes = await _drawingController.getImageData();
      if (imageBytes == null) {
        _showSnackBar('Failed to capture drawing');
        return false;
      }
      final base64Image = base64Encode(imageBytes.buffer.asUint8List());
      if (base64Image.isEmpty) {
        _showSnackBar('Failed to generate image data');
        return false;
      }
      FFAppState().update(() => FFAppState().drawingImage = base64Image);
      await widget.saveImage();
      if (widget.refreshUI != null) await widget.refreshUI!();
      _showSnackBar('Drawing saved successfully!');
      return true;
    } catch (e) {
      _showSnackBar('Error saving drawing: $e');
      return false;
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _shareDrawing() async {
    if (_isLoading || !mounted) return;
    setState(() => _isLoading = true);
    try {
      final imageData = await _drawingController.getImageData();
      if (imageData == null) {
        _showSnackBar('Failed to capture drawing');
        return;
      }
      if (!kIsWeb) {
        await _requestPermissions();
        final tempDir = await getTemporaryDirectory();
        final file = await File('${tempDir.path}/drawing.png').create();
        await file.writeAsBytes(imageData.buffer.asUint8List());
        await Share.shareXFiles([XFile(file.path)],
            text: 'Check out my drawing!');
      } else {
        final base64Image = base64Encode(imageData.buffer.asUint8List());
        await Share.share(
            'Check out my drawing! data:image/png;base64,$base64Image');
      }
      await widget.shareImage();
      _showSnackBar('Drawing shared successfully!');
    } catch (e) {
      _showSnackBar('Error sharing drawing: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _requestPermissions() async {
    if (kIsWeb) return;
    final permissions =
        Platform.isAndroid ? [Permission.storage] : [Permission.photos];
    for (var permission in permissions) {
      final status = await permission.request();
      if (status.isDenied) {
        _showSnackBar(
            '${permission == Permission.storage ? 'Storage' : 'Photos'} permission required');
      }
    }
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: kSnackBarDuration),
    );
  }

  Future<void> _undo() async {
    if (!_canUndo()) return;
    final currentImageData = await _drawingController.getImageData();
    if (currentImageData != null)
      _redoStack.add(currentImageData.buffer.asUint8List());
    _undoStack.removeLast();
    await _restoreFrom(_undoStack.isNotEmpty ? _undoStack.last : null);
    setState(() {});
  }

  Future<void> _redo() async {
    if (!_canRedo()) return;
    final currentImageData = await _drawingController.getImageData();
    if (currentImageData != null)
      _undoStack.add(currentImageData.buffer.asUint8List());
    final nextState = _redoStack.removeLast();
    await _restoreFrom(nextState);
    setState(() {});
  }

  Future<void> _restoreFrom(Uint8List? bytes) async {
    if (bytes == null) {
      _drawingController.clear();
      return;
    }
    final completer = Completer<ui.Image>();
    ui.decodeImageFromList(bytes, (ui.Image img) => completer.complete(img));
    final image = await completer.future;
    if (image != null) {
      _drawingController.clear();
      _drawingController.addContent(
        ImageContent(image,
            startPoint: Offset.zero, size: Offset(widget.width, widget.height)),
      );
    }
  }

  bool _canUndo() => _undoStack.length > 1;
  bool _canRedo() => _redoStack.isNotEmpty;

  void _clear() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Clear Drawing'),
        content: Text('Are you sure you want to clear the entire drawing?'),
        actions: [
          TextButton(
            onPressed: Navigator.of(context).pop,
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              _drawingController.clear();
              _undoStack.clear();
              _redoStack.clear();
              setState(() => _backgroundColor = Colors.white);
              _saveCurrentState();
              Navigator.of(context).pop();
            },
            child: Text('Clear'),
          ),
        ],
      ),
    );
  }

  Widget _buildToolButton({
    required VoidCallback onPressed,
    String? imagePath,
    Color? backgroundColor,
    Color? iconColor,
    bool isSelected = false,
    required String tooltip,
    bool enabled = true,
  }) {
    return Expanded(
      child: Tooltip(
        message: tooltip,
        child: ElevatedButton(
          onPressed: enabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: backgroundColor ?? Colors.transparent,
            disabledBackgroundColor: Colors.grey[300],
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(kButtonRadius)),
            side: isSelected ? BorderSide(color: Colors.black, width: 2) : null,
            minimumSize: Size(60, 60), // Larger for iPad
          ),
          child: imagePath != null
              ? Image.asset(
                  imagePath,
                  width: 32,
                  height: 32,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) => Icon(
                    _getIconFromPath(imagePath),
                    size: 32,
                    color: iconColor ?? Colors.grey,
                  ),
                )
              : Icon(Icons.error, size: 32),
        ),
      ),
    );
  }

  IconData _getIconFromPath(String path) {
    return {
          'assets/images/palette.png': Icons.palette,
          'assets/images/brush.png': Icons.brush,
          'assets/images/eraser.png': Icons.cleaning_services,
          'assets/images/undo.png': Icons.undo,
          'assets/images/redo.png': Icons.redo,
          'assets/images/trash.png': Icons.delete,
          'assets/images/line.png': Icons.horizontal_rule,
          'assets/images/square.png': Icons.crop_square,
          'assets/images/circle.png': Icons.circle_outlined,
          'assets/images/triangle.png': Icons.change_history,
          'assets/images/fill.png': Icons.format_color_fill,
        }[path] ??
        Icons.error;
  }

  Widget _buildCanvas(double canvasWidth, double canvasHeight) {
    return Container(
      width: canvasWidth,
      height: canvasHeight,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey, width: kCanvasBorderWidth),
        borderRadius: BorderRadius.circular(kButtonRadius),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(kButtonRadius),
        child: DrawingBoard(
            controller: _drawingController,
            background: Container(
              width: canvasWidth,
              height: canvasHeight,
              color: _backgroundColor,
              child: widget.showGrid
                  ? CustomPaint(
                      painter: GridPainter(),
                      size: Size(canvasWidth, canvasHeight),
                    )
                  : null,
            ),
            showDefaultActions: false,
            showDefaultTools: false,
          ),
      ),
    );
  }

  Widget _buildToolbar() {
    return SizedBox(
      height: 60,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildToolButton(
            onPressed: () => _showColorPicker(),
            imagePath: 'assets/images/palette.png',
            backgroundColor: _currentColor,
            iconColor: _currentColor.computeLuminance() > 0.5
                ? Colors.black
                : Colors.white,
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
      ),
    );
  }

  Widget _buildShapesToolbar() {
    return SizedBox(
      height: 60,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildToolButton(
            onPressed: () => _showColorPicker(isBackground: true),
            imagePath: 'assets/images/fill.png',
            backgroundColor: _backgroundColor,
            iconColor: _backgroundColor.computeLuminance() > 0.5
                ? Colors.black
                : Colors.white,
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
      ),
    );
  }

  Widget _buildActionButton(
      {required String label,
      required IconData icon,
      required VoidCallback onPressed}) {
    return ElevatedButton(
      onPressed: _isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: FlutterFlowTheme.of(context).primary,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(kButtonRadius)),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 24),
          SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: FlutterFlowTheme.of(context).primaryText,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildActionButton(
            label: 'Save',
            icon: Icons.save,
            onPressed: _saveDrawing,
          ),
          _buildActionButton(
            label: 'Share',
            icon: Icons.share,
            onPressed: _shareDrawing,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final canvasWidth = constraints.maxWidth;
        final canvasHeight = canvasWidth / kDefaultAspectRatio;
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildCanvas(canvasWidth, canvasHeight),
            SizedBox(height: 10),
            _buildToolbar(),
            SizedBox(height: 10),
            _buildShapesToolbar(),
            SizedBox(height: 10),
            _buildActionButtons(),
          ],
        );
      },
    );
  }
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.withOpacity(0.2)
      ..strokeWidth = 0.5;
    const gridSize = 20.0;
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

class ImageContent extends PaintContent {
  ImageContent(this.image, {required this.startPoint, required this.size});
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
    canvas.drawImageRect(
      image,
      Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble()),
      Rect.fromPoints(startPoint, startPoint + this.size),
      Paint(),
    );
  }

  @override
  ImageContent copy() =>
      ImageContent(image, startPoint: startPoint, size: size);

  @override
  Map<String, dynamic> toContentJson() => {
        'startPoint': {'dx': startPoint.dx, 'dy': startPoint.dy},
        'size': {'dx': size.dx, 'dy': size.dy},
      };
}

class CustomTriangle extends PaintContent {
  CustomTriangle();
  CustomTriangle.data({
    required this.startPoint,
    required this.A,
    required this.B,
    required this.C,
    required Paint paint,
  }) : super.paint(paint);

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
    A = Offset(startPoint.dx + dx * 0.5, startPoint.dy - dy * 0.8);
    B = Offset(startPoint.dx - dx * 0.2, startPoint.dy + dy * 0.7);
    C = nowPoint;
  }

  @override
  void draw(Canvas canvas, Size size, bool deeper) {
    final path = Path()
      ..moveTo(A.dx, A.dy)
      ..lineTo(B.dx, B.dy)
      ..lineTo(C.dx, C.dy)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  CustomTriangle copy() => CustomTriangle();

  @override
  Map<String, dynamic> toContentJson() => {
        'startPoint': {'dx': startPoint.dx, 'dy': startPoint.dy},
        'A': {'dx': A.dx, 'dy': A.dy},
        'B': {'dx': B.dx, 'dy': B.dy},
        'C': {'dx': C.dx, 'dy': C.dy},
      };
}
