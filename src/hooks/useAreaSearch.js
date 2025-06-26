import React, { useState, useEffect, useCallback } from 'react';

const AREAS_COMPLETAS = [
  { num_area: 5510000000, nombre_area: 'ALCALDIA' },
  { num_area: 5510100000, nombre_area: 'Secretaria Particular' },
  { num_area: 5510100001, nombre_area: 'J.U.D. de Control de Agenda y Logistica' },
  { num_area: 5510100002, nombre_area: 'J.U.D. de Correspondencia y Archivo' },
  { num_area: 5510200000, nombre_area: 'Direccion Ejecutiva de Comunicación Social e Imagen Institucional' },
  { num_area: 5510200001, nombre_area: 'J.U.D. de Comunicación Social' },
  { num_area: 5510200002, nombre_area: 'J.U.D. de Estrategia de Medios' },
  { num_area: 5510200003, nombre_area: 'J.U.D. de Desarrollo y Manejo de Imagen Institucional' },
  { num_area: 5510001000, nombre_area: 'Coordinacion de Asesores' },
  { num_area: 5510001010, nombre_area: 'Asesor "A"' },
  { num_area: 5510001020, nombre_area: 'Asesor "B"' },
  { num_area: 5510001030, nombre_area: 'Asesor "C"' },
  { num_area: 5510001040, nombre_area: 'Asesor "D"' },
  { num_area: 5510201000, nombre_area: 'Coordinacion de Control y Seguimiento de Asuntos Juridicos y de Gobierno' },
  { num_area: 5510202000, nombre_area: 'Direccion de Asuntos Juridicos' },
  { num_area: 5510202010, nombre_area: 'Subdireccion Juridica' },
  { num_area: 5510202011, nombre_area: 'J.U.D. de Asuntos Legales' },
  { num_area: 5510202012, nombre_area: 'J.U.D. de Dictaminacion de Instrumentos Juridicos' },
  { num_area: 5510202013, nombre_area: 'J.U.D. de lo Consultivo y Control Territorial' },
  { num_area: 5510203000, nombre_area: 'Direccion de Vigilancia y Verificaciones' },
  { num_area: 5510203010, nombre_area: 'Subdireccion de Verificacion, Monitoreo y Selección' },
  { num_area: 5510203011, nombre_area: 'J.U.D. de Programas de Verificacion' },
  { num_area: 5510203012, nombre_area: 'J.U.D. de Monitoreo y Selección' },
  { num_area: 5510203020, nombre_area: 'Subdireccion de Vigilancia e Infracciones' },
  { num_area: 5510203021, nombre_area: 'J.U.D. Calificadora de Infracciones' },
  { num_area: 5510203022, nombre_area: 'J.U.D. de Vigilancia Administrativa' },
  { num_area: 5510204000, nombre_area: 'Direccion de Gobierno' },
  { num_area: 5510204010, nombre_area: 'Subdireccion de Gobierno' },
  { num_area: 5510204011, nombre_area: 'J.U.D. de Giros Mercantiles y Espectaculos Publicos' },
  { num_area: 5510204012, nombre_area: 'J.U.D. de Panteones y Juntas de Reclutamiento' },
  { num_area: 5510204013, nombre_area: 'J.U.D. de Control Vehicular' },
  { num_area: 5510204020, nombre_area: 'Subdireccion de Mercados y Via Publica' },
  { num_area: 5510204021, nombre_area: 'J.U.D. de Mercados' },
  { num_area: 5510204022, nombre_area: 'J.U.D. de Comercio en Via Publica' },
  { num_area: 5510300000, nombre_area: 'DIRECCION GENERAL DE ADMINISTRACION' },
  { num_area: 5510301000, nombre_area: 'Cooridnacion de Control y Seguimiento de Administracion' },
  { num_area: 5510302000, nombre_area: 'Direccion de Administracion de Capital Humano' },
  { num_area: 5510302010, nombre_area: 'Subdireccion de Relaciones Laborales y Capacitacion' },
  { num_area: 5510302011, nombre_area: 'J.U.D. de Relaciones Laborales y Prestaciones' },
  { num_area: 5510302012, nombre_area: 'J.U.D. de Capacitacion y Desarrollo de Personal' },
  { num_area: 5510302020, nombre_area: 'Subdireccion de Administracion de Personal' },
  { num_area: 5510302021, nombre_area: 'J.U.D. de Movimientos de Personal' },
  { num_area: 5510302022, nombre_area: 'J.U.D. de Nomina y Pagos' },
  { num_area: 5510303000, nombre_area: 'Direccion de Finanzas' },
  { num_area: 5510303010, nombre_area: 'Subdireccion de Tesoreria y Pagos' },
  { num_area: 5510303020, nombre_area: 'Subdireccion de Planeacion, Programacion y Presupuesto' },
  { num_area: 5510303021, nombre_area: 'J.U.D. de Programacion y Presupuesto' },
  { num_area: 5510303030, nombre_area: 'Subdireccion de Evaluacion y Control' },
  { num_area: 5510303031, nombre_area: 'J.U.D. de Contabilidad Gubernamental' },
  { num_area: 5510303032, nombre_area: 'J.U.D. de Administracion de Recursos de Aplicación Automatica' },
  { num_area: 5510304000, nombre_area: 'Direccion de Recursos Materiales, Abastecimientos y Servicios' },
  { num_area: 5510304010, nombre_area: 'Subdireccion de Recursos Materiales y Archivos' },
  { num_area: 5510304011, nombre_area: 'J.U.D. de Adquisiciones' },
  { num_area: 5510304012, nombre_area: 'J.U.D. de Almacenes e inventarios' },
  { num_area: 5510304013, nombre_area: 'J.U.D. de Archivos' },
  { num_area: 5510304020, nombre_area: 'Subdireccion de Servicios Generales' },
  { num_area: 5510304021, nombre_area: 'J.U.D. de Siniestros, Servicios y Mantenimiento a Instalaciones' },
  { num_area: 5510304022, nombre_area: 'J.U.D. de Mantenimiento Automotriz y Combustible' },
  { num_area: 5510400000, nombre_area: 'DIRECCION GENERAL DE OBRAS Y DESARROLLO URBANO' },
  { num_area: 5510401000, nombre_area: 'Coordinacion de Control y Seguimiento de Obras y Desarrollo Urbano' },
  { num_area: 5510402000, nombre_area: 'Direccion de Proyectos y Supervision de Obras' },
  { num_area: 5510402010, nombre_area: 'Subdireccion de Proyectos' },
  { num_area: 5510402011, nombre_area: 'J.U.D. de Ingenieria e Infraestructura' },
  { num_area: 5510402020, nombre_area: 'Subdireccion de Supervisor de Obras' },
  { num_area: 5510402021, nombre_area: 'J.U.D. de Vialidades Y Equipamiento Urbano' },
  { num_area: 5510402022, nombre_area: 'J.U.D. de Edificios Publicos' },
  { num_area: 5510403000, nombre_area: 'Direccion de Control de Obras y Desarrollo Urbano' },
  { num_area: 5510403010, nombre_area: 'Subdireccion de Licencias e Infraestructura Urbana' },
  { num_area: 5510403011, nombre_area: 'J.U.D. de Manifestaciones, Licencias y Regularizacion de Construcciones' },
  { num_area: 5510403020, nombre_area: 'Subdireccion de Control Tecnico de Obra' },
  { num_area: 5510403021, nombre_area: 'J.U.D. de Licitaciones y Contratacion' },
  { num_area: 5510403022, nombre_area: 'J.U.D. de Control de Avance de Obra' },
  { num_area: 5510500000, nombre_area: 'DIRECCION GENERAL DE DESARROLLO SOCIAL' },
  { num_area: 5510500010, nombre_area: 'Coordinacion de Vinculacion' },
  { num_area: 5510500020, nombre_area: 'Coordinacion de Apoyos para una Vivienda Digna' },
  { num_area: 5510500030, nombre_area: 'Coordinacion de control y Seguimiento de Desarrollo Social' },
  { num_area: 5510500031, nombre_area: 'J.U.D. de Apoyos Logisticos' },
  { num_area: 5510500032, nombre_area: 'J.U.D. de Control y Seguimiento de Centros Generadores' },
  { num_area: 5510501000, nombre_area: 'Direccion de Servicios Medicos y Equidad Social' },
  { num_area: 5510501010, nombre_area: 'Subdireccion de Igualdad Social' },
  { num_area: 5510501011, nombre_area: 'J.U.D. de Atencion Prioritaria a Grupos Vulnerables' },
  { num_area: 5510501012, nombre_area: 'J.U.D. de Pueblos Originarios' },
  { num_area: 5510501013, nombre_area: 'J.U.D. de Derechos Humanos' },
  { num_area: 5510501014, nombre_area: 'J.U.D. de Atencion a la Juventud' },
  { num_area: 5510501015, nombre_area: 'J.U.D. de Diversidad Sexual' },
  { num_area: 5510501016, nombre_area: 'J.U.D. de Genero e Igualdad Sustantiva' },
  { num_area: 5510501020, nombre_area: 'Subdireccion de Servicios de Salud' },
  { num_area: 5510502000, nombre_area: 'Direccion de Educacion' },
  { num_area: 5510502010, nombre_area: 'Subdireccion de Apoyos Educativos' },
  { num_area: 5510502011, nombre_area: 'J.U.D. de Centros de Atencion y Cuidado Infantil' },
  { num_area: 5510502012, nombre_area: 'J.U.D. de Apoyos Escolares' },
  { num_area: 5510502013, nombre_area: 'J.U.D. de Fomento a la Lectura' },
  { num_area: 5510600000, nombre_area: 'DIRECCION GENERAL DE SERVICIOS URBANOS' },
  { num_area: 5510600001, nombre_area: 'J.U.D. de Concursos y Contratos de Obra Publica' },
  { num_area: 5510601000, nombre_area: 'Coordinacion de Control y Seguimiento de Servicios Urbanos' },
  { num_area: 5510602000, nombre_area: 'Direccion de Desarrollo de la Zona Centro y Mantenimiento a Monumentos Historicos' },
  { num_area: 5510602001, nombre_area: 'J.U.D. de Mantenimiento al Patrimonio Historico' },
  { num_area: 5510603000, nombre_area: 'Direccion de Ecologia y Desarrollo Sustentable' },
  { num_area: 5510603010, nombre_area: 'Surdireccion de Conservacion del Medio Ambiente' },
  { num_area: 5510603011, nombre_area: 'J.U.D. de Ecologia' },
  { num_area: 5510603012, nombre_area: 'J.U.D. de Educacion Ambiental y Cultura del Agua' },
  { num_area: 5510604000, nombre_area: 'Direccion de Servicios Publicos' },
  { num_area: 5510604001, nombre_area: 'J.U.D. de Supervision de Obra Publica' },
  { num_area: 5510604010, nombre_area: 'Subdireccion de Manejo y Control de Residuos Solidos' },
  { num_area: 5510604011, nombre_area: 'J.U.D. de Limpia y Separacion de Residuos Solidos' },
  { num_area: 5510604020, nombre_area: 'Subdireccion de Operación de Infraestructura' },
  { num_area: 5510604021, nombre_area: 'J.U.D. de Operación Hidraulica' },
  { num_area: 5510604022, nombre_area: 'J.U.D. de Obras Viales' },
  { num_area: 5510604023, nombre_area: 'J.U.D. de Alumbrado Publico' },
  { num_area: 5510604024, nombre_area: 'J.U.D. de Señalizacion y Nomenclatura' },
  { num_area: 5510605000, nombre_area: 'Direccion de Mejoramiento Urbano' },
  { num_area: 5510605010, nombre_area: 'Subdireccion de Areas Verdes' },
  { num_area: 5510605011, nombre_area: 'J.U.D. de Parques y Jardines' },
  { num_area: 5510605020, nombre_area: 'Subdireccion de Conservacion de Espacios Publicos' },
  { num_area: 5510605021, nombre_area: 'J.U.D. de Conservacion de Espacios Publicos' },
  { num_area: 5510605022, nombre_area: 'J.U.D. de Mejoramientos de la Imagen Urbana' },
  { num_area: 5510700000, nombre_area: 'DIRECCION GENERAL DE PARTICIPACION CIUDADANA Y GESTION SOCIAL' },
  { num_area: 5510701000, nombre_area: 'Direccion de Programas Comunitarios e Iniciativas Ciudadanas' },
  { num_area: 5510701010, nombre_area: 'Subdireccion de Programas Comunitarios' },
  { num_area: 5510701011, nombre_area: 'J.U.D. de Iniciativas, Colaboraciones y Consulta Ciudadana' },
  { num_area: 5510701012, nombre_area: 'J.U.D. de Gestion y Atencion a la Vivienda' },
  { num_area: 5510701013, nombre_area: 'J.U.D. de Cultura Civica' },
  { num_area: 5510702000, nombre_area: 'Direccion de Participacion y Vinculacion Ciudadana' },
  { num_area: 5510702100, nombre_area: 'SUBDIRECCION DE ENLACE CIUDADANO Y GESTION SOCIAL' },
  { num_area: 5510702101, nombre_area: 'J.U.D. de Promocion de la Participacion Ciudadana' },
  { num_area: 5510702102, nombre_area: 'J.U.D. de Vinculacion y Gestion Ciudadana' },
  { num_area: 5510800000, nombre_area: 'DIRECCION GENERAL DE INTEGRACION TERRITORIAL' },
  { num_area: 5510800010, nombre_area: 'Subdireccion de Orientacion a la Gestion Territorial de Obras y Servicios' },
  { num_area: 5510800011, nombre_area: 'J.U.D. de Analisis de la Demanda Ciudadana' },
  { num_area: 5510800012, nombre_area: 'J.U.D. de Infraestructura Territorial' },
  { num_area: 5510800020, nombre_area: 'Subdireccion de Asistencia a las Unidades Departamentales Juridicas Territoriales' },
  { num_area: 5510800021, nombre_area: 'J.U.D. de Programas Especiales' },
  { num_area: 5510800022, nombre_area: 'J.U.D. de Analisis de Asuntos Juridicos Territoriales' },
  { num_area: 5510800030, nombre_area: 'Subdireccion de Apoyo a las Unidades Departamentales de Desarrollo Social' },
  { num_area: 5510800031, nombre_area: 'J.U.D. de Seguimiento de Programas Sociales en Direcciones Territoriales' },
  { num_area: 5510800032, nombre_area: 'J.U.D. de Atencion a Audiencias Territoriales' },
  { num_area: 5510801000, nombre_area: 'Coordinacion de Control y Seguimiento de Integracion Territorial' },
  { num_area: 5510800100, nombre_area: 'Direccion Territorial Zona 1' },
  { num_area: 5510800101, nombre_area: 'J.U.D. de Orientacion Juridica Zona 1' },
  { num_area: 5510800102, nombre_area: 'J.U.D. de Obras y Servicios Zona 1' },
  { num_area: 5510800103, nombre_area: 'J.U.D. de Desarrollo Social Zona 1' },
  { num_area: 5510800104, nombre_area: 'J.U.D. de Administracion Zona 1' },
  { num_area: 5510800200, nombre_area: 'Direccion Territorial Zona 2' },
  { num_area: 5510800201, nombre_area: 'J.U.D. de Orientacion Juridica Zona 2' },
  { num_area: 5510800202, nombre_area: 'J.U.D. de Obras y Servicios Zona 2' },
  { num_area: 5510800203, nombre_area: 'J.U.D. de Desarrollo Social Zona 2' },
  { num_area: 5510800204, nombre_area: 'J.U.D. de Administracion Zona 2' },
  { num_area: 5510800300, nombre_area: 'Direccion Territorial Zona 3' },
  { num_area: 5510800301, nombre_area: 'J.U.D. de Orientacion Juridica Zona 3' },
  { num_area: 5510800302, nombre_area: 'J.U.D. de Obras y Servicios Zona 3' },
  { num_area: 5510800303, nombre_area: 'J.U.D. de Desarrollo Social Zona 3' },
  { num_area: 5510800304, nombre_area: 'J.U.D. de Administracion Zona 3' },
  { num_area: 5510800400, nombre_area: 'Direccion Territorial Zona 4' },
  { num_area: 5510800401, nombre_area: 'J.U.D. de Orientacion Juridica Zona 4' },
  { num_area: 5510800402, nombre_area: 'J.U.D. de Obras y Servicios Zona 4' },
  { num_area: 5510800403, nombre_area: 'J.U.D. de Desarrollo Social Zona 4' },
  { num_area: 5510800404, nombre_area: 'J.U.D. de Administracion Zona 4' },
  { num_area: 5510800500, nombre_area: 'Direccion Territorial Zona 5' },
  { num_area: 5510800501, nombre_area: 'J.U.D. de Orientacion Juridica Zona 5' },
  { num_area: 5510800502, nombre_area: 'J.U.D. de Obras y Servicios Zona 5' },
  { num_area: 5510800503, nombre_area: 'J.U.D. de Desarrollo Social Zona 5' },
  { num_area: 5510800504, nombre_area: 'J.U.D. de Administracion Zona 5' },
  { num_area: 5510800600, nombre_area: 'Direccion Territorial Zona 6' },
  { num_area: 5510800601, nombre_area: 'J.U.D. de Orientacion Juridica Zona 6' },
  { num_area: 5510800602, nombre_area: 'J.U.D. de Obras y Servicios Zona 6' },
  { num_area: 5510800603, nombre_area: 'J.U.D. de Desarrollo Social Zona 6' },
  { num_area: 5510800604, nombre_area: 'J.U.D. de Administracion Zona 6' },
  { num_area: 5510800700, nombre_area: 'Direccion Territorial Zona 7' },
  { num_area: 5510800701, nombre_area: 'J.U.D. de Orientacion Juridica Zona 7' },
  { num_area: 5510800702, nombre_area: 'J.U.D. de Obras y Servicios Zona 7' },
  { num_area: 5510800703, nombre_area: 'J.U.D. de Desarrollo Social Zona 7' },
  { num_area: 5510800704, nombre_area: 'J.U.D. de Administracion Zona 7' },
  { num_area: 5510800800, nombre_area: 'Direccion Territorial Zona 8' },
  { num_area: 5510800801, nombre_area: 'J.U.D. de Orientacion Juridica Zona 8' },
  { num_area: 5510800802, nombre_area: 'J.U.D. de Obras y Servicios Zona 8' },
  { num_area: 5510800803, nombre_area: 'J.U.D. de Desarrollo Social Zona 8' },
  { num_area: 5510800804, nombre_area: 'J.U.D. de Administracion Zona 8' },
  { num_area: 5510800900, nombre_area: 'Direccion Territorial Zona 9' },
  { num_area: 5510800901, nombre_area: 'J.U.D. de Orientacion Juridica Zona 9' },
  { num_area: 5510800902, nombre_area: 'J.U.D. de Obras y Servicios Zona 9' },
  { num_area: 5510800903, nombre_area: 'J.U.D. de Desarrollo Social Zona 9' },
  { num_area: 5510800904, nombre_area: 'J.U.D. de Administracion Zona 9' },
  { num_area: 5510801001, nombre_area: 'J.U.D. de Orientacion Juridica Zona 10' },
  { num_area: 5510801002, nombre_area: 'J.U.D. de Obras y Servicios Zona 10' },
  { num_area: 5510801003, nombre_area: 'J.U.D. de Desarrollo Social Zona 10' },
  { num_area: 5510801004, nombre_area: 'J.U.D. de Administracion Zona 10' },
  { num_area: 5510910000, nombre_area: 'DIRECCION EJECUTIVA TRANSPARENCIA, ACCESO A LA INFORMACION Y PLANEACION DEL DESARROLLO' },
  { num_area: 5510910010, nombre_area: 'Subdireccion de Planeacion y Evaluacion' },
  { num_area: 5510910011, nombre_area: 'J.U.D. de Evaluacion de Programas' },
  { num_area: 5510910012, nombre_area: 'J.U.D. de Proyectos Especiales' },
  { num_area: 5510910020, nombre_area: 'Subdireccion de Transparencia y Acceso a la Informacion' },
  { num_area: 5510910030, nombre_area: 'Coordinacion del Programa de Supervision a la Gestion' },
  { num_area: 5510920000, nombre_area: 'DIRECCION EJECUTIVA DE MEJORA CONTINUA A LA GESTION GUBERNAMENTAL' },
  { num_area: 5510920010, nombre_area: 'Coordinacion del Centro de Servicios y Atencion Ciudadana' },
  { num_area: 5510920020, nombre_area: 'Cooridnacion de Ventanilla Unica de Trámites' },
  { num_area: 5510920030, nombre_area: 'Coordinacion de Modernizacion Administrativa' },
  { num_area: 5510920031, nombre_area: 'J.U.D. de Arquitectura Organizacional' },
  { num_area: 5510920040, nombre_area: 'Coordinacion de Tecnologias de la Informacion' },
  { num_area: 5510920041, nombre_area: 'J.U.D. de Desarrollo de Sistemas' },
  { num_area: 5510920042, nombre_area: 'J.U.D. de Mantenimiento y Soporte Tecnico' },
  { num_area: 5510930000, nombre_area: 'DIRECCION EJECUTIVA DE DESARROLLO ECONOMICO' },
  { num_area: 5510930010, nombre_area: 'Subdireccion de Fomento a la Micro y Pequeña Empresa' },
  { num_area: 5510930011, nombre_area: 'J.U.D. de Abasto y Comercializacion' },
  { num_area: 5510930020, nombre_area: 'Subdireccion de Politicas, Planes y Programas' },
  { num_area: 5510930021, nombre_area: 'J.U.D. de Evaluacion y Seguimiento' },
  { num_area: 5510930022, nombre_area: 'J.U.D. de Programas y Proyectos de Inversion' },
  { num_area: 5510940000, nombre_area: 'DIRECCION EJECUTIVA DE FOMENTO COOPERATIVO' },
  { num_area: 5510940010, nombre_area: 'Subdireccion de Capacitacion para el Desarrollo de Empresas Sociales' },
  { num_area: 5510940020, nombre_area: 'Subdireccion de Fomento Cooperativo' },
  { num_area: 5510940021, nombre_area: 'J.U.D. de Implementacion de Proyectos Comunitarios' },
  { num_area: 5510940022, nombre_area: 'J.U.D. de Vinculacion con Empresas Sociales' },
  { num_area: 5510950000, nombre_area: 'DIRECCION EJECUTIVA DE SEGURIDAD CIUDADANA, GESTION INTEGRAL DE RIESGOS Y PROTECCION CIVIL' },
  { num_area: 5510950010, nombre_area: 'Subdireccion de Prevencion del Delito' },
  { num_area: 5510950011, nombre_area: 'J.U.D. de Programas de Prevencion' },
  { num_area: 5510950020, nombre_area: 'Subdireccion de Operaciones de Seguridad Ciudadana' },
  { num_area: 5510950021, nombre_area: 'J.U.D. de Apoyo Vial' },
  { num_area: 5510950022, nombre_area: 'J.U.D. de Coordinacion Sectorial' },
  { num_area: 5510951000, nombre_area: 'Coordinacion de Control y Seguimiento de Seguridad Ciudadana y Gestión Integral de Riesgos' },
  { num_area: 5510952000, nombre_area: 'Direccion de la Unidad Gestión Integral de Riesgos y Proteccion Civil' },
  { num_area: 5510952001, nombre_area: 'J.U.D. de Gestión Integral y Atencion a Emergencias' },
  { num_area: 5510952002, nombre_area: 'J.U.D. de Programas de Prevencion y Atencion a Desastres' },
  { num_area: 5510960000, nombre_area: 'DIRECCION EJECUTIVA DE CULTURA, RECREACION Y DEPORTE' },
  { num_area: 5510961000, nombre_area: 'Coordinacion de Control y Seguimiento de Cultura Recreacion y Deporte' },
  { num_area: 5510962000, nombre_area: 'Coordinacion del Centro Cultural Futurama' },
  { num_area: 5510963000, nombre_area: 'Direccion de Cultura y Recreacion' },
  { num_area: 5510963010, nombre_area: 'Subdireccion de Actividades Culturales y Turismos' },
  { num_area: 5510963011, nombre_area: 'J.U.D. de Turismo' },
  { num_area: 5510963012, nombre_area: 'J.U.D. de Centros Culturales' },
  { num_area: 5510964000, nombre_area: 'Direccion de Deporte' },
  { num_area: 5510964010, nombre_area: 'Subdireccion de Promocion Deportiva' },
  { num_area: 5510964011, nombre_area: 'J.U.D. de Actividades Deportivas' },
  { num_area: 5510964012, nombre_area: 'J.U.D. de Centros Deportivos' }
];


export const useAreaSearch = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [areaData, setAreaData] = useState([]);

  // Inicialización simple y rápida
  const initializeDatabase = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🚀 Inicializando áreas...');

      // Usar directamente el array de áreas
      const formattedAreas = AREAS_COMPLETAS.map(area => ({
        ...area,
        search_text: `${area.num_area} ${area.nombre_area}`.toLowerCase()
      }));
      
      setAreaData(formattedAreas);
      setIsInitialized(true);
      console.log(`✅ Áreas inicializadas: ${formattedAreas.length} áreas`);

    } catch (err) {
      console.error('❌ Error inicializando áreas:', err);
      setError('Error inicializando áreas');
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Búsqueda eficiente en el array
  const searchAreas = useCallback(async (searchText = '', limit = 50) => {
    if (!searchText.trim()) {
      setAreas([]);
      return [];
    }

    try {
      setIsSearching(true);
      setError(null);

      const searchTerm = searchText.toLowerCase().trim();
      
      const results = areaData
        .filter(area => 
          area.num_area.toString().includes(searchTerm) || 
          area.nombre_area.toLowerCase().includes(searchTerm)
        )
        .slice(0, limit);
      
      const formattedAreas = results.map(area => ({
        id: area.num_area,
        label: `${area.num_area} - ${area.nombre_area}`,
        value: area.num_area,
        nombre_area: area.nombre_area
      }));

      setAreas(formattedAreas);
      return formattedAreas;
      
    } catch (err) {
      console.error('❌ Error búsqueda áreas:', err);
      setError('Error en búsqueda áreas');
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [areaData]);

  // Obtener área específica por número
  const getAreaByNumber = useCallback(async (num_area) => {
    if (!num_area) return null;

    try {
      const result = areaData.find(area => area.num_area === num_area);
      
      if (result) {
        return {
          id: result.num_area,
          label: `${result.num_area} - ${result.nombre_area}`,
          value: result.num_area,
          nombre_area: result.nombre_area
        };
      }
      
      return null;
    } catch (err) {
      console.error('❌ Error obteniendo área:', err);
      return null;
    }
  }, [areaData]);

  // Estadísticas
  const getDatabaseStats = useCallback(async () => {
    try {
      return { 
        totalAreas: areaData.length,
        mode: 'array'
      };
    } catch (err) {
      console.error('❌ Error estadísticas áreas:', err);
      return { totalAreas: 0, mode: 'error' };
    }
  }, [areaData]);

  // Inicializar
  useEffect(() => {
    console.log('🎬 Hook áreas montado');
    
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Timeout áreas - forzando inicialización');
        setIsLoading(false);
        setIsInitialized(true);
        setError('Modo emergencia activado');
      }
    }, 2000); // 2 segundos máximo

    initializeDatabase().finally(() => {
      clearTimeout(safetyTimeout);
    });

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [initializeDatabase]);

  return {
    // Estados
    isLoading,
    isSearching,
    areas,
    error,
    isReady: isInitialized,
    isInitialized,
    
    // Funciones
    searchAreas,
    getAreaByNumber,
    getDatabaseStats,
    
    // Control
    reinitialize: initializeDatabase,
    closeDatabase: () => {},
  };
};