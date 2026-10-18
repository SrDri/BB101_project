#!/usr/bin/env python3
"""
TRAMO PROTOCOL — GENERADOR DE EXPEDIENTE OFICIAL DE SUPERVISIÓN TÉCNICA Y FIDUCIARIA (PDF)
Genera un documento PDF institucional con validez legal (Ley 1796 de 2016, NSR-10 y Ley 527 de 1999).
Diseñado para ser comprensible tanto para autoridades de control como para personas sin conocimientos técnicos.
"""

import os
import sys
import tempfile
import qrcode
from svglib.svglib import svg2rlg
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
    PageBreak,
    HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Agrega pie de página institucional y número de página X de Y."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Línea de pie de página
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(36, 32, letter[0] - 36, 32)
        
        # Texto pie de página
        footer_text = "TRAMO PROTOCOL · Protocolo Descentralizado de Fe Pública Inmobiliaria · Stellar Soroban Testnet"
        page_str = f"Página {self._pageNumber} de {page_count}"
        
        self.drawString(36, 22, footer_text)
        self.drawRightString(letter[0] - 36, 22, page_str)
        self.restoreState()


def build_official_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Estilos tipográficos personalizados
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569')
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    bold_mono = ParagraphStyle(
        'BoldMono',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )
    
    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#334155')
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#1e293b')
    )
    
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # 1. ENCABEZADO INSTITUCIONAL CON LOGO
    logo_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "static", "black_logo_ui_v1.svg")
    logo_flowable = None
    if os.path.exists(logo_path):
        try:
            drawing = svg2rlg(logo_path)
            factor = 28.0 / drawing.height
            drawing.width = drawing.width * factor
            drawing.height = 28.0
            drawing.scale(factor, factor)
            logo_flowable = drawing
        except Exception as e:
            print("Notice: Fallback text logo due to:", e)

    meta_header_right = Paragraph(
        "<b>EXPEDIENTE N° CERT-ALAMEDA-004</b><br/>"
        "Fecha Emisión: 18 Octubre 2026<br/>"
        "<font color='#059669'><b>Ledger Stellar #5264904</b></font><br/>"
        "Estado: Sellado Inmutable / Verificado",
        ParagraphStyle('HeaderRight', parent=styles['Normal'], fontName='Courier', fontSize=7.5, leading=9.5, alignment=2)
    )

    if logo_flowable:
        header_table = Table([[logo_flowable, meta_header_right]], colWidths=[240, 300])
    else:
        header_table = Table([[Paragraph("<b>TRAMO PROTOCOL</b>", title_style), meta_header_right]], colWidths=[240, 300])

    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("EXPEDIENTE OFICIAL DE CERTIFICACIÓN TÉCNICA DE OBRA Y GIRO FIDUCIARIO", title_style))
    story.append(Paragraph(
        "Validez legal conforme a la <b>Ley 1796 de 2016</b> (Ley de Vivienda Segura), <b>Reglamento Colombiano Sismorresistente NSR-10</b> y <b>Ley 527 de 1999</b> (Mensajes de Datos y Firmas Digitales).",
        subtitle_style
    ))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0f172a'), spaceAfter=8))

    # 2. GUÍA DE LECTURA CIUDADANA Y PARA AUTORIDADES (SIN CONOCIMIENTO TÉCNICO)
    guide_title = Paragraph("<b>GUÍA DE INTERPRETACIÓN CIUDADANA E INSTITUCIONAL (SIN CONOCIMIENTOS TÉCNICOS)</b>", ParagraphStyle('GT', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor('#92400e')))
    
    col1 = Paragraph("<b>1. Avance Real Comprobado:</b><br/>Constata que la torre alcanzó el 44.5% de obra física real (losas completas hasta piso 5 y mampostería) antes de autorizar cualquier desembolso de dinero.", callout_text)
    col2 = Paragraph("<b>2. Seguridad Estructural:</b><br/>El concreto superó los 4000 PSI exigidos por la norma de sismos NSR-10 en laboratorio acreditado ONAC (resistencia promedio 4250 PSI).", callout_text)
    col3 = Paragraph("<b>3. Protección de Fondos:</b><br/>La Fiduciaria retuvo el 5% legal de fondo de garantía ($9.736.842 COP) para responder ante los compradores por vicios ocultos y posventa.", callout_text)
    col4 = Paragraph("<b>4. Sello Inviolable Stellar:</b><br/>El certificado está anclado en la red pública Stellar Soroban. Si alguien adultera el documento o una foto, la huella matemática falla de inmediato.", callout_text)

    guide_table = Table([[guide_title], [Table([[col1, col2, col3, col4]], colWidths=[130, 130, 130, 130])]], colWidths=[540])
    guide_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef3c7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#f59e0b')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(guide_table)
    story.append(Spacer(1, 10))

    # 3. FICHA TÉCNICA Y LEGAL DEL FIDEICOMISO Y PROYECTO
    proj_box = Paragraph("<b>Proyecto Inmobiliario:</b><br/>Alameda del Río · Barranquilla<br/><font color='#64748b'>Estrato 4 · 120 Unidades</font>", table_cell)
    fidu_box = Paragraph("<b>Patrimonio Autónomo:</b><br/>FIDEICOMISO ALAMEDA DEL RÍO<br/><font color='#64748b'>Fiduciaria Central (Superfinanciera)</font>", table_cell)
    const_box = Paragraph("<b>Constructora / Promotor:</b><br/>Constructora Metrópolis S.A.S.<br/><font color='#64748b'>NIT: 900.842.193-2 · Licencia #2</font>", table_cell)
    sup_box = Paragraph("<b>Interventoría Técnica:</b><br/>Gómez & Asociados Consultoría<br/><font color='#64748b'>Matrícula COPNIA: 08202-14920</font>", table_cell)

    meta_table = Table([[proj_box, fidu_box, const_box, sup_box]], colWidths=[135, 135, 135, 135])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 4. SECCIÓN 1: BALANCE DE AVANCE FÍSICO Y GIRO FIDUCIARIO
    story.append(Paragraph("<b>1. BALANCE FÍSICO Y LIQUIDACIÓN FIDUCIARIA (CORTE N° 4)</b>", section_title))
    story.append(Spacer(1, 4))

    prog_box1 = Paragraph("<font color='#64748b'>Avance Programado:</font><br/><b>44.0%</b>", ParagraphStyle('P1', parent=table_cell, alignment=1))
    prog_box2 = Paragraph("<font color='#059669'><b>Avance Certificado:</b></font><br/><font size='9' color='#059669'><b>44.5%</b> (+0.5% ruta crítica)</font>", ParagraphStyle('P2', parent=table_cell, alignment=1))
    prog_box3 = Paragraph("<font color='#d97706'><b>Retención Ley 1796 (5%):</b></font><br/><b>$9.736.842 COP</b>", ParagraphStyle('P3', parent=table_cell, alignment=1))
    prog_box4 = Paragraph("<font color='#0f172a'><b>Giro Neto Autorizado ACH:</b></font><br/><b>$185.000.000 COP</b>", ParagraphStyle('P4', parent=table_cell, alignment=1))

    metric_table = Table([[prog_box1, prog_box2, prog_box3, prog_box4]], colWidths=[135, 135, 135, 135])
    metric_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#ecfdf5')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#fef3c7')),
        ('BACKGROUND', (3,0), (3,0), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(metric_table)
    story.append(Spacer(1, 5))

    # Tabla de Capítulos de Obra
    chap_rows = [
        [Paragraph("<b>Capítulo de Obra Civil</b>", table_cell_bold), Paragraph("<b>Ponderación</b>", table_cell_bold), Paragraph("<b>Avance Real</b>", table_cell_bold), Paragraph("<b>Estado de Entrega</b>", table_cell_bold)],
        [Paragraph("1. Cimentación profunda, pilotes y muros pantalla", table_cell), Paragraph("15.0%", table_cell), Paragraph("<b>100.0%</b>", table_cell), Paragraph("<font color='#059669'><b>Recibido a Satisfacción</b></font>", table_cell)],
        [Paragraph("2. Estructura portante de concreto armado (Pisos 1 al 5)", table_cell), Paragraph("35.0%", table_cell), Paragraph("<b>72.0%</b>", table_cell), Paragraph("<font color='#059669'><b>Conforme a Cronograma</b></font>", table_cell)],
        [Paragraph("3. Mampostería estructural y divisorios de ladrillo", table_cell), Paragraph("20.0%", table_cell), Paragraph("<b>45.0%</b>", table_cell), Paragraph("En Ejecución", table_cell)],
        [Paragraph("4. Redes hidrosanitarias, eléctricas y contra incendio", table_cell), Paragraph("15.0%", table_cell), Paragraph("<b>30.0%</b>", table_cell), Paragraph("En Ejecución", table_cell)]
    ]
    chap_table = Table(chap_rows, colWidths=[240, 70, 80, 150])
    chap_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(chap_table)
    story.append(Spacer(1, 10))

    # 5. SECCIÓN 2: CONTROL DE CALIDAD Y ENSAYOS NSR-10 (ONAC)
    story.append(Paragraph("<b>2. CONTROL DE CALIDAD Y ENSAYOS DE LABORATORIO ACREDITADOS ONAC (NSR-10)</b>", section_title))
    story.append(Spacer(1, 4))

    lab_rows = [
        [Paragraph("<b>Ensayo / Material</b>", table_cell_bold), Paragraph("<b>Laboratorio Acreditado</b>", table_cell_bold), Paragraph("<b>Norma / Diseño</b>", table_cell_bold), Paragraph("<b>Resultado 28 días</b>", table_cell_bold), Paragraph("<b>Dictamen Legal</b>", table_cell_bold)],
        [Paragraph("Resistencia Compresión Concreto Losa P4", table_cell), Paragraph("Lab. Ingetec ONAC #14-LAB-029", table_cell), Paragraph("NSR-10 / 4000 PSI", table_cell), Paragraph("<b>4250 PSI (106%)</b>", table_cell), Paragraph("<font color='#059669'><b>✓ Cumple NSR-10</b></font>", table_cell)],
        [Paragraph("Rotura Cilindros Columnas Eje C-3 (Piso 3)", table_cell), Paragraph("Lab. Concretos del Norte ONAC", table_cell), Paragraph("NSR-10 / 4000 PSI", table_cell), Paragraph("<b>4180 PSI (104%)</b>", table_cell), Paragraph("<font color='#059669'><b>✓ Cumple NSR-10</b></font>", table_cell)],
        [Paragraph("Ensayo Tracción Acero Corrugado W60", table_cell), Paragraph("SGS Colombia S.A.S.", table_cell), Paragraph("NTC 2289 / 420 MPa", table_cell), Paragraph("<b>465 MPa (110%)</b>", table_cell), Paragraph("<font color='#059669'><b>✓ Cumple NSR-10</b></font>", table_cell)],
        [Paragraph("Asentamiento de Cono Slump Losa P5", table_cell), Paragraph("Control de Calidad Obra Directa", table_cell), Paragraph("NTC 396 / 5.0 ± 1 pulg", table_cell), Paragraph("<b>5.2 pulgadas</b>", table_cell), Paragraph("<font color='#059669'><b>✓ Conforme</b></font>", table_cell)],
    ]
    lab_table = Table(lab_rows, colWidths=[170, 130, 80, 80, 80])
    lab_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    story.append(lab_table)
    story.append(Spacer(1, 10))

    # 6. SECCIÓN 3: FE PÚBLICA EN STELLAR SOROBAN (BLOQUE CRIPTOGRÁFICO)
    story.append(Paragraph("<b>3. SELLO INMUTABLE DE FE PÚBLICA EN RED STELLAR SOROBAN (TESTNET)</b>", section_title))
    story.append(Spacer(1, 4))

    # Generar imagen QR temporal
    qr_data = "https://stellar.expert/explorer/testnet/tx/452ef966702a172ed2be7ba0fc53ea306661bfe34900e53ad5b648dfbc33d4be"
    qr_img = qrcode.make(qr_data)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_qr:
        qr_img.save(tmp_qr.name)
        tmp_qr_path = tmp_qr.name

    qr_flowable = RLImage(tmp_qr_path, width=70, height=70)
    
    crypto_details = Paragraph(
        "<b>Contrato Inteligente (corte_registry en Rust):</b><br/>"
        "<font name='Courier' size='7'>CB5L2JGJIAXUUORKHBJFGLS5Y3BOW6LE44WEQ23JEK3KTIN2I252H44T</font><br/><br/>"
        "<b>Hash de Transacción On-Chain (Ledger #5264904):</b><br/>"
        "<font name='Courier' size='7'>452ef966702a172ed2be7ba0fc53ea306661bfe34900e53ad5b648dfbc33d4be</font><br/><br/>"
        "<b>Huella Criptográfica Canónica del Expediente (SHA-256):</b><br/>"
        "<font name='Courier' size='7' color='#059669'><b>a7c93e41b2e8d7541f6e2983c48520d88b489920efbc756312a0f8d9b1c7849e</b></font><br/>"
        "<font size='7' color='#64748b'>Merkle Root de 48 Fotografías Georreferenciadas: 7b8e91f0c2a4... · Almacenamiento IPFS WORM</font>",
        table_cell
    )

    qr_label = Paragraph("<font size='6.5' color='#475569'><b>Escanear con celular para auditar en Stellar.Expert</b></font>", ParagraphStyle('QRL', parent=styles['Normal'], alignment=1))
    qr_cell = Table([[qr_flowable], [qr_label]], colWidths=[80])
    qr_cell.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))

    crypto_table = Table([[crypto_details, qr_cell]], colWidths=[450, 90])
    crypto_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10b981')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(crypto_table)
    story.append(Spacer(1, 14))

    # 7. SECCIÓN 4: CUADRO DE FIRMAS LEGALES ACREDITADAS
    sign_header = Paragraph("<b>ATRIBUCIÓN LEGAL, AUTORIZACIÓN FIDUCIARIA Y FIRMAS RESPONSABLES</b>", ParagraphStyle('SH', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8, alignment=1, textColor=colors.HexColor('#475569')))
    story.append(sign_header)
    story.append(Spacer(1, 6))

    sign1 = Paragraph("<i>Ing. Juan José Carabalí</i><br/><br/><b>Ing. Juan José Carabalí</b><br/>Director Interventoría Técnica<br/><font color='#059669'>COPNIA: 08202-14920</font>", ParagraphStyle('S1', parent=table_cell, alignment=1))
    sign2 = Paragraph("<i>Arq. Carlos Mendoza</i><br/><br/><b>Arq. Carlos Mendoza</b><br/>Representante Legal Constructora<br/>Radicado: RAD-2026-AL4", ParagraphStyle('S2', parent=table_cell, alignment=1))
    sign3 = Paragraph("<i>Dra. Patricia Gómez</i><br/><br/><b>Dra. Patricia Gómez</b><br/>Oficial Comité Fiduciario<br/><font color='#059669'>Giro ACH Autorizado: 95%</font>", ParagraphStyle('S3', parent=table_cell, alignment=1))

    sign_table = Table([[sign1, sign2, sign3]], colWidths=[180, 180, 180])
    sign_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(sign_table)

    # Construir documento
    doc.build(story, canvasmaker=NumberedCanvas)
    
    # Limpiar archivo temporal QR
    try:
        os.remove(tmp_qr_path)
    except Exception:
        pass

    print(f"[OK] Documento PDF oficial generado exitosamente en: {output_path}")

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "docs", "semana4")
    os.makedirs(out_dir, exist_ok=True)
    target_pdf = os.path.join(out_dir, "Reporte_Oficial_Tramo_Corte4.pdf")
    build_official_pdf(target_pdf)
