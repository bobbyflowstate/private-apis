import type { FullRequest } from "@/lib/types/requests";

function renderJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

export function RequestConfiguration({ request }: { request: FullRequest }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100">Configuration</h2>
      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium text-slate-200">Headers</p>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-800/70 bg-slate-900/80 p-3 text-xs text-slate-300">
            {renderJson(request.headers ?? {})}
          </pre>
        </div>
        <div>
          <p className="font-medium text-slate-200">Query parameters</p>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-800/70 bg-slate-900/80 p-3 text-xs text-slate-300">
            {renderJson(request.query_params ?? {})}
          </pre>
        </div>
        <div>
          <p className="font-medium text-slate-200">Body template</p>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-slate-800/70 bg-slate-900/80 p-3 text-xs text-slate-300">
            {renderJson(request.body_template ?? {})}
          </pre>
        </div>
        <div>
          <p className="font-medium text-slate-200">Parameters</p>
          <div className="mt-2 space-y-2">
            {(request.request_parameters ?? []).map((parameter) => (
              <div
                key={parameter.id}
                className="rounded-lg border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-xs text-slate-400"
              >
                <p className="font-semibold text-slate-200">{parameter.key}</p>
                <p>Type: {parameter.type}</p>
                <p>{parameter.required ? "Required" : "Optional"}</p>
                {parameter.default_value && <p>Default: {parameter.default_value}</p>}
                {parameter.config && <p className="mt-1 text-slate-500">Config: {renderJson(parameter.config)}</p>}
              </div>
            ))}
            {(request.request_parameters?.length ?? 0) === 0 && (
              <p className="rounded-lg border border-dashed border-slate-700 px-3 py-6 text-center text-xs text-slate-500">
                No parameters configured.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
