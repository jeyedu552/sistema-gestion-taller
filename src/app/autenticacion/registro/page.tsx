import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-4 sm:p-8 font-sans">
      <main className="w-full max-w-[1024px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm">
        
        {/* Mitad Izquierda: Branding e Información para el Cliente */}
        <div className="hidden md:flex flex-col justify-between p-8 xl:p-12 bg-[#000f3f] text-white relative overflow-hidden">
          {/* Fondo Técnico Automotriz con Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              alt="Fondo Técnico Automotriz" 
              className="w-full h-full object-cover grayscale contrast-125 opacity-40" 
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000f3f] via-[#000f3f]/40 to-transparent"></div>
          </div>

          <div className="z-10 relative">
            <div className="flex items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-[32px] text-blue-400">precision_manufacturing</span>
              <h1 className="text-2xl font-semibold tracking-tight text-white">AutoCore Pro</h1>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white">El Control de tu Vehículo en tus Manos</h2>
            <p className="text-base text-blue-100/80 max-w-[320px] leading-relaxed mb-8">
              Accede a nuestro portal de clientes para realizar el seguimiento de tus órdenes de servicio en tiempo real, revisar el historial técnico y mantenerte en contacto directo con nuestros especialistas.
            </p>
          </div>
          
          <div className="z-10 relative flex flex-col gap-4 mt-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400">check_circle</span>
              <span className="text-sm font-medium text-white">Seguimiento en Tiempo Real</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400">check_circle</span>
              <span className="text-sm font-medium text-white">Historial de Mantenimiento Digital</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-400">check_circle</span>
              <span className="text-sm font-medium text-white">Comunicación Directa con el Mecánico</span>
            </div>
          </div>
        </div>

        {/* Mitad Derecha: Formulario de Registro de Clientes */}
        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-on-surface mb-2">Crear Cuenta</h2>
            <p className="text-sm text-on-surface-variant">Ingresa tus datos personales para comenzar.</p>
          </div>
          
          <form className="flex flex-col gap-5">
            {/* Nombre Completo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="fullName">
                Nombre Completo
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                <input 
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none text-on-surface" 
                  id="fullName" 
                  name="fullName" 
                  placeholder="Juan Pérez" 
                  required 
                  type="text"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                <input 
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none text-on-surface" 
                  id="email" 
                  name="email" 
                  placeholder="juan.perez@example.com" 
                  required 
                  type="email"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                <input 
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none text-on-surface" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                />
              </div>
              <p className="text-[11px] text-outline mt-1">Debe tener al menos 8 caracteres.</p>
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start gap-2 mt-2">
              <input 
                className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                id="terms" 
                name="terms" 
                required 
                type="checkbox"
              />
              <label className="text-sm text-on-surface-variant leading-tight cursor-pointer" htmlFor="terms">
                Acepto los <Link className="text-primary hover:underline font-medium" href="/terminos">Términos de Servicio</Link> y la <Link className="text-primary hover:underline font-medium" href="/privacidad">Política de Privacidad</Link>.
              </label>
            </div>

            {/* Botón de Enviar */}
            <button 
              className="w-full mt-4 bg-primary text-white py-3 px-6 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.98] shadow-sm" 
              type="submit"
            >
              Crear Cuenta
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Enlace de Footer */}
          <div className="mt-8 pt-6 border-t border-outline-variant text-center">
            <p className="text-sm text-on-surface-variant">
              ¿Ya tienes una cuenta?{' '}
              <Link className="text-primary font-bold hover:underline ml-1" href="/autenticacion/inicio-sesion">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}